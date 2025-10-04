import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstimateVersion {
  id: string;
  invoice_id: string;
  change_request_id?: string;
  version_number: number;
  line_items: any; // Using any to match Supabase Json type
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'active' | 'superseded' | 'archived';
  notes?: string;
  created_at: string;
  created_by: string;
}

interface VersionComparison {
  added: any[];
  removed: any[];
  modified: any[];
  priceChange: number;
}

interface UseEstimateVersioningProps {
  invoiceId: string;
  onVersionChanged?: (version: EstimateVersion) => void;
}

export function useEstimateVersioning({ 
  invoiceId, 
  onVersionChanged 
}: UseEstimateVersioningProps) {
  const [versions, setVersions] = useState<EstimateVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<EstimateVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceId) {
      loadVersions();
    }
  }, [invoiceId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estimate_versions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'active' | 'superseded' | 'archived'
      }));
      setVersions(typedData);
      if (typedData.length > 0) {
        setCurrentVersion(typedData[0]);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      toast({
        title: "Error",
        description: "Failed to load estimate versions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVersion = useCallback(async (
    lineItems: any[],
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    notes?: string,
    changeRequestId?: string
  ): Promise<EstimateVersion | null> => {
    try {
      setLoading(true);

      // Get the next version number
      const nextVersionNumber = versions.length > 0 
        ? Math.max(...versions.map(v => v.version_number)) + 1 
        : 1;

      // Mark previous versions as superseded
      if (versions.length > 0) {
        await supabase
          .from('estimate_versions')
          .update({ status: 'superseded' })
          .eq('invoice_id', invoiceId)
          .eq('status', 'active');
      }

      // Create new version
      const newVersion = {
        invoice_id: invoiceId,
        change_request_id: changeRequestId,
        version_number: nextVersionNumber,
        line_items: lineItems,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'active' as const,
        notes,
        created_by: 'admin' // TODO: Get from auth context
      };

      const { data, error } = await supabase
        .from('estimate_versions')
        .insert(newVersion)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        status: data.status as 'draft' | 'active' | 'superseded' | 'archived'
      };

      // Update the main invoice with the new version
      await supabase
        .from('invoices')
        .update({
          line_items: lineItems,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      // Log the version creation
      await supabase
        .from('workflow_state_log')
        .insert({
          entity_type: 'invoice',
          entity_id: invoiceId,
          previous_status: currentVersion ? `v${currentVersion.version_number}` : 'initial',
          new_status: `v${nextVersionNumber}`,
          changed_by: 'admin',
          change_reason: changeRequestId ? 'Customer change request' : 'Admin revision',
          metadata: {
            version_id: typedData.id,
            change_request_id: changeRequestId,
            price_change: currentVersion 
              ? totalAmount - currentVersion.total_amount 
              : totalAmount
          }
        });

      await loadVersions();
      onVersionChanged?.(typedData);

      toast({
        title: "Version Created",
        description: `Created version ${nextVersionNumber} of the estimate`,
      });

      return typedData;

    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: "Error",
        description: "Failed to create estimate version",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [invoiceId, versions, currentVersion, onVersionChanged, toast]);

  const revertToVersion = useCallback(async (versionId: string) => {
    try {
      setLoading(true);

      const targetVersion = versions.find(v => v.id === versionId);
      if (!targetVersion) {
        throw new Error('Version not found');
      }

      // Ensure line_items is an array
      const lineItems = Array.isArray(targetVersion.line_items) 
        ? targetVersion.line_items 
        : [];

      // Create a new version based on the target version
      const newVersion = await createVersion(
        lineItems,
        targetVersion.subtotal,
        targetVersion.tax_amount,
        targetVersion.total_amount,
        `Reverted to version ${targetVersion.version_number}`
      );

      if (newVersion) {
        toast({
          title: "Version Reverted",
          description: `Reverted to version ${targetVersion.version_number}`,
        });
      }

    } catch (error) {
      console.error('Error reverting version:', error);
      toast({
        title: "Error",
        description: "Failed to revert to version",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [versions, createVersion, toast]);

  const compareVersions = useCallback((
    version1: EstimateVersion,
    version2: EstimateVersion
  ): VersionComparison => {
    const items1 = Array.isArray(version1.line_items) ? version1.line_items : [];
    const items2 = Array.isArray(version2.line_items) ? version2.line_items : [];

    // Find added items (in version2 but not in version1)
    const added = items2.filter(item2 => 
      !items1.some(item1 => item1.title === item2.title)
    );

    // Find removed items (in version1 but not in version2)
    const removed = items1.filter(item1 => 
      !items2.some(item2 => item2.title === item1.title)
    );

    // Find modified items
    const modified = items2.filter(item2 => {
      const item1 = items1.find(item1 => item1.title === item2.title);
      return item1 && (
        item1.quantity !== item2.quantity ||
        item1.unit_price !== item2.unit_price ||
        item1.description !== item2.description
      );
    }).map(item2 => {
      const item1 = items1.find(item1 => item1.title === item2.title);
      return {
        ...item2,
        changes: {
          quantity: item1?.quantity !== item2.quantity,
          unit_price: item1?.unit_price !== item2.unit_price,
          description: item1?.description !== item2.description,
          previous: item1
        }
      };
    });

    const priceChange = version2.total_amount - version1.total_amount;

    return {
      added,
      removed,
      modified,
      priceChange
    };
  }, []);

  const getVersionSummary = useCallback((version: EstimateVersion) => {
    const lineItems = Array.isArray(version.line_items) ? version.line_items : [];
    const itemCount = lineItems.length;
    const categories = [...new Set(
      lineItems.map((item: any) => item.category)
    )];

    return {
      itemCount,
      categories,
      formattedTotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(version.total_amount / 100),
      createdAt: new Date(version.created_at).toLocaleString()
    };
  }, []);

  // Generate line-level diff for UI highlighting
  const generateLineDiff = useCallback((
    oldVersion: EstimateVersion,
    newVersion: EstimateVersion
  ): { itemId: string; type: 'added' | 'removed' | 'modified'; changes?: { field: string; oldValue: any; newValue: any }[] }[] => {
    const diff: { itemId: string; type: 'added' | 'removed' | 'modified'; changes?: { field: string; oldValue: any; newValue: any }[] }[] = [];
    const oldItems = Array.isArray(oldVersion.line_items) ? oldVersion.line_items : [];
    const newItems = Array.isArray(newVersion.line_items) ? newVersion.line_items : [];

    // Create maps for faster lookup
    const oldItemMap = new Map(oldItems.map((item: any) => [item.id || item.description, item]));
    const newItemMap = new Map(newItems.map((item: any) => [item.id || item.description, item]));

    // Check for added and modified items
    newItems.forEach((newItem: any) => {
      const key = newItem.id || newItem.description;
      const oldItem = oldItemMap.get(key);

      if (!oldItem) {
        // Item was added
        diff.push({
          itemId: key,
          type: 'added'
        });
      } else {
        // Check for modifications
        const changes: { field: string; oldValue: any; newValue: any }[] = [];

        if (oldItem.quantity !== newItem.quantity) {
          changes.push({ field: 'quantity', oldValue: oldItem.quantity, newValue: newItem.quantity });
        }
        if (oldItem.unit_price !== newItem.unit_price) {
          changes.push({ field: 'unit_price', oldValue: oldItem.unit_price, newValue: newItem.unit_price });
        }
        if (oldItem.description !== newItem.description) {
          changes.push({ field: 'description', oldValue: oldItem.description, newValue: newItem.description });
        }
        if (oldItem.title !== newItem.title) {
          changes.push({ field: 'title', oldValue: oldItem.title, newValue: newItem.title });
        }

        if (changes.length > 0) {
          diff.push({
            itemId: key,
            type: 'modified',
            changes
          });
        }
      }
    });

    // Check for removed items
    oldItems.forEach((oldItem: any) => {
      const key = oldItem.id || oldItem.description;
      if (!newItemMap.has(key)) {
        diff.push({
          itemId: key,
          type: 'removed'
        });
      }
    });

    return diff;
  }, []);

  const archiveVersion = useCallback(async (versionId: string) => {
    try {
      const { error } = await supabase
        .from('estimate_versions')
        .update({ status: 'archived' })
        .eq('id', versionId);

      if (error) throw error;

      await loadVersions();
      toast({
        title: "Version Archived",
        description: "Version has been archived",
      });

    } catch (error) {
      console.error('Error archiving version:', error);
      toast({
        title: "Error",
        description: "Failed to archive version",
        variant: "destructive"
      });
    }
  }, [loadVersions, toast]);

  const exportVersionHistory = useCallback(() => {
    const exportData = versions.map(version => ({
      version: version.version_number,
      created: version.created_at,
      created_by: version.created_by,
      total_amount: version.total_amount / 100,
      status: version.status,
      notes: version.notes,
      item_count: Array.isArray(version.line_items) ? version.line_items.length : 0
    }));

    const csvContent = [
      ['Version', 'Created', 'Created By', 'Total Amount', 'Status', 'Notes', 'Item Count'],
      ...exportData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimate_${invoiceId}_version_history.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Version history exported to CSV",
    });
  }, [versions, invoiceId, toast]);

  return {
    versions,
    currentVersion,
    loading,
    createVersion,
    revertToVersion,
    compareVersions,
    getVersionSummary,
    generateLineDiff,
    archiveVersion,
    exportVersionHistory,
    refreshVersions: loadVersions
  };
}
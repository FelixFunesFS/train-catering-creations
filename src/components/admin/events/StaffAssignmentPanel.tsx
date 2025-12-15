import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Users, Trash2, CheckCircle2, Clock, 
  ChefHat, Truck, Utensils, Wine, Loader2 
} from 'lucide-react';
import { 
  useStaffAssignments, 
  useCreateStaffAssignment, 
  useUpdateStaffAssignment,
  useDeleteStaffAssignment,
  StaffAssignment 
} from '@/hooks/useStaffAssignments';

interface StaffAssignmentPanelProps {
  quoteId: string;
  compact?: boolean;
}

const roleConfig: Record<StaffAssignment['role'], { label: string; icon: typeof ChefHat; color: string }> = {
  lead_chef: { label: 'Lead Chef', icon: ChefHat, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  sous_chef: { label: 'Sous Chef', icon: ChefHat, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  server: { label: 'Server', icon: Utensils, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  driver: { label: 'Driver', icon: Truck, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  setup_crew: { label: 'Setup Crew', icon: Users, color: 'bg-green-100 text-green-700 border-green-200' },
  bartender: { label: 'Bartender', icon: Wine, color: 'bg-pink-100 text-pink-700 border-pink-200' },
};

export function StaffAssignmentPanel({ quoteId, compact = false }: StaffAssignmentPanelProps) {
  const { data: staff = [], isLoading } = useStaffAssignments(quoteId);
  const createMutation = useCreateStaffAssignment();
  const updateMutation = useUpdateStaffAssignment();
  const deleteMutation = useDeleteStaffAssignment();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staff_name: '',
    role: 'server' as StaffAssignment['role'],
    arrival_time: '',
    notes: '',
  });

  const confirmedCount = staff.filter(s => s.confirmed).length;

  const handleAddStaff = async () => {
    if (!newStaff.staff_name.trim()) return;
    
    await createMutation.mutateAsync({
      quoteId,
      assignment: {
        staff_name: newStaff.staff_name.trim(),
        role: newStaff.role,
        arrival_time: newStaff.arrival_time || null,
        notes: newStaff.notes || null,
      },
    });
    
    setNewStaff({ staff_name: '', role: 'server', arrival_time: '', notes: '' });
    setShowAddForm(false);
  };

  const handleToggleConfirm = async (assignment: StaffAssignment) => {
    await updateMutation.mutateAsync({
      assignmentId: assignment.id,
      quoteId,
      updates: { confirmed: !assignment.confirmed },
    });
  };

  const handleDelete = async (assignmentId: string) => {
    await deleteMutation.mutateAsync({ assignmentId, quoteId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact view for summary panel
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{staff.length} staff assigned</span>
          </div>
          {staff.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {confirmedCount}/{staff.length} confirmed
            </span>
          )}
        </div>
        {staff.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {staff.slice(0, 4).map((s) => {
              const config = roleConfig[s.role];
              return (
                <Badge key={s.id} variant="outline" className={`text-xs ${config.color}`}>
                  {s.staff_name}
                </Badge>
              );
            })}
            {staff.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{staff.length - 4} more
              </Badge>
            )}
          </div>
        )}
        {staff.length === 0 && (
          <p className="text-xs text-muted-foreground">No staff assigned yet</p>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Staff Assignments
        </h4>
        <span className="text-sm text-muted-foreground">
          {confirmedCount}/{staff.length} confirmed
        </span>
      </div>

      {/* Staff list */}
      {staff.length > 0 && (
        <div className="space-y-2">
          {staff.map((assignment) => {
            const config = roleConfig[assignment.role];
            const RoleIcon = config.icon;
            
            return (
              <div 
                key={assignment.id}
                className={`flex items-center gap-3 p-2 rounded-lg border ${
                  assignment.confirmed ? 'bg-green-50/50 border-green-200' : 'bg-card'
                }`}
              >
                <Checkbox
                  checked={assignment.confirmed}
                  onCheckedChange={() => handleToggleConfirm(assignment)}
                  className="shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{assignment.staff_name}</span>
                    <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                    {assignment.confirmed && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {assignment.arrival_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Arrive: {assignment.arrival_time.slice(0, 5)}
                      </span>
                    )}
                    {assignment.notes && (
                      <span className="truncate">{assignment.notes}</span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(assignment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {staff.length === 0 && !showAddForm && (
        <div className="text-center py-6 border rounded-lg bg-muted/20">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No staff assigned</p>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Staff
          </Button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Staff name"
              value={newStaff.staff_name}
              onChange={(e) => setNewStaff({ ...newStaff, staff_name: e.target.value })}
              className="text-sm"
            />
            <Select
              value={newStaff.role}
              onValueChange={(value) => setNewStaff({ ...newStaff, role: value as StaffAssignment['role'] })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              placeholder="Arrival time"
              value={newStaff.arrival_time}
              onChange={(e) => setNewStaff({ ...newStaff, arrival_time: e.target.value })}
              className="text-sm"
            />
            <Input
              placeholder="Notes (optional)"
              value={newStaff.notes}
              onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddStaff} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add button when staff exists */}
      {staff.length > 0 && !showAddForm && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      )}
    </div>
  );
}

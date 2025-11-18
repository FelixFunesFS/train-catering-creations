import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  EMAIL_VARIABLE_CATEGORIES, 
  extractVariables, 
  VariableData,
  EmailVariable 
} from '@/utils/emailVariables';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface TemplateVariableHelperProps {
  data: VariableData;
  onInsertVariable?: (variableKey: string) => void;
  compact?: boolean;
}

export function TemplateVariableHelper({ 
  data, 
  onInsertVariable,
  compact = false 
}: TemplateVariableHelperProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Customer Information']));
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  
  const variables = extractVariables(data);

  const toggleCategory = (categoryLabel: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryLabel)) {
      newExpanded.delete(categoryLabel);
    } else {
      newExpanded.add(categoryLabel);
    }
    setExpandedCategories(newExpanded);
  };

  const handleInsertVariable = (variable: EmailVariable) => {
    const variableTag = `{${variable.key}}`;
    
    if (onInsertVariable) {
      onInsertVariable(variableTag);
    } else {
      navigator.clipboard.writeText(variableTag);
      setCopiedVar(variable.key);
      setTimeout(() => setCopiedVar(null), 2000);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {EMAIL_VARIABLE_CATEGORIES.flatMap(cat => 
          cat.variables.map(variable => {
            const value = variables[variable.key];
            return (
              <Badge 
                key={variable.key}
                variant="outline" 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleInsertVariable(variable)}
                title={`Click to insert: {${variable.key}}`}
              >
                <span className="font-mono text-xs">{`{${variable.key}}`}</span>
                {value && (
                  <span className="ml-2 text-muted-foreground">
                    → {value.substring(0, 20)}{value.length > 20 ? '...' : ''}
                  </span>
                )}
              </Badge>
            );
          })
        )}
      </div>
    );
  }

  return (
    <Card className="border-muted">
      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-2">
          <p className="text-sm font-medium mb-3">
            Available Variables
            <span className="text-xs text-muted-foreground ml-2">
              Click to insert
            </span>
          </p>
          
          {EMAIL_VARIABLE_CATEGORIES.map(category => {
            const isExpanded = expandedCategories.has(category.label);
            
            return (
              <Collapsible
                key={category.label}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.label)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto py-2 px-3 hover:bg-accent"
                  >
                    <span className="text-sm font-medium">{category.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1 px-3 pb-2">
                  {category.variables.map(variable => {
                    const value = variables[variable.key];
                    const isCopied = copiedVar === variable.key;
                    
                    return (
                      <div
                        key={variable.key}
                        className="group flex items-start justify-between p-2 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleInsertVariable(variable)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                              {`{${variable.key}}`}
                            </code>
                            {isCopied && (
                              <Check className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {variable.description}
                          </p>
                          {value && (
                            <p className="text-xs text-foreground/70 mt-1 font-medium">
                              Current: {value}
                            </p>
                          )}
                        </div>
                        
                        <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-0.5" />
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableLineItemProps {
  id: string;
  children: ReactNode;
}

export function SortableLineItem({ id, children }: SortableLineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

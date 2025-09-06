import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcuts;
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    
    // Build shortcut string
    const modifiers = [];
    if (ctrlKey || metaKey) modifiers.push('ctrl');
    if (shiftKey) modifiers.push('shift');
    if (altKey) modifiers.push('alt');
    
    const shortcutKey = [...modifiers, key.toLowerCase()].join('+');
    
    // Check for matching shortcut
    if (shortcuts[shortcutKey]) {
      event.preventDefault();
      event.stopPropagation();
      shortcuts[shortcutKey]();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);

  return null;
}

// Common shortcut combinations
export const SHORTCUTS = {
  SAVE: 'ctrl+s',
  CANCEL: 'escape',
  NEW: 'ctrl+n',
  DELETE: 'ctrl+d',
  EDIT: 'ctrl+e',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+shift+z'
} as const;
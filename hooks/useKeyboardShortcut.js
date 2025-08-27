import { useEffect, useCallback } from 'react';

/**
 * A custom hook for handling keyboard shortcuts
 * @param {string} targetKey - The key to listen for
 * @param {Function} handler - The function to call when the key is pressed
 * @param {Object} options - Configuration options
 * @param {boolean} [options.ctrlKey=false] - Whether the Ctrl key needs to be pressed
 * @param {boolean} [options.shiftKey=false] - Whether the Shift key needs to be pressed
 * @param {boolean} [options.altKey=false] - Whether the Alt key needs to be pressed
 * @param {boolean} [options.metaKey=false] - Whether the Meta/Command key needs to be pressed
 * @param {boolean} [options.enabled=true] - Whether the event listener is active
 * @param {HTMLElement|Window} [options.target=window] - The target element to attach the event listener to
 */
function useKeyboardShortcut(
  targetKey,
  handler,
  {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    enabled = true,
    target = typeof window !== 'undefined' ? window : null,
  } = {}
) {
  const handleKeyDown = useCallback(
    (event) => {
      // Check if the pressed key matches our target key and modifier keys
      if (
        event.key === targetKey &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey
      ) {
        // Prevent the default action
        event.preventDefault();
        
        // Call the handler
        handler(event);
      }
    },
    [targetKey, handler, ctrlKey, shiftKey, altKey, metaKey]
  );

  useEffect(() => {
    if (!enabled || !target) return;

    // Add event listener
    target.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleKeyDown, enabled]);
}

export default useKeyboardShortcut;

import { useEffect, useRef } from 'react';

/**
 * A custom hook that triggers a callback when a click occurs outside of the specified element
 * @param {Function} handler - The function to call when a click outside occurs
 * @param {boolean} [enabled=true] - Whether the event listener is active
 * @returns {Object} A ref that should be attached to the element to track
 */
function useClickOutside(handler, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      // If the click was outside the ref element
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    // Using a timeout to ensure this runs after the current event loop
    // This prevents immediate triggering when the hook is first called
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

export default useClickOutside;

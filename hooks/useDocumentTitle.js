import { useEffect } from 'react';

/**
 * A custom hook that updates the document title
 * @param {string} title - The title to set
 * @param {Object} options - Configuration options
 * @param {boolean} [options.restoreOnUnmount=false] - Whether to restore the previous title when the component unmounts
 * @param {string} [options.prefix=''] - A prefix to add to the title
 * @param {string} [options.separator=' | '] - The separator between the prefix and the title
 */
function useDocumentTitle(
  title,
  { 
    restoreOnUnmount = false, 
    prefix = '',
    separator = ' | ' 
  } = {}
) {
  const defaultTitle = typeof document !== 'undefined' ? document.title : '';
  
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const newTitle = prefix 
      ? `${prefix}${separator}${title}` 
      : title;
    
    document.title = newTitle;
    
    if (restoreOnUnmount) {
      return () => {
        document.title = defaultTitle;
      };
    }
  }, [title, restoreOnUnmount, defaultTitle, prefix, separator]);
}

export default useDocumentTitle;

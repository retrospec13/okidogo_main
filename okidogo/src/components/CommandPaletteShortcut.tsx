import { useKBar } from 'kbar';
import { useEffect } from 'react';

const CommandPaletteShortcut = () => {
  const kbar = useKBar();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        
        // Open the palette and force focus
        kbar.query.toggle();
        
        // Small delay to ensure input gets focused
        setTimeout(() => {
          const searchInput = document.querySelector('.kbar-search-input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 50);
      }
    };
    
    // Add listener with capture phase to get it before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [kbar]);
  
  return null;
};

export default CommandPaletteShortcut; 
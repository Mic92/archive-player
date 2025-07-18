import { useEffect } from 'react';
import { App } from '@capacitor/app';

export function useTVNavigation(onBack?: () => boolean) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Map TV remote keys to actions
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Let browser handle navigation
          break;
        
        case 'Enter':
        case ' ':
          // Handle selection
          const focused = document.activeElement as HTMLElement;
          if (focused && focused.click) {
            e.preventDefault();
            focused.click();
          }
          break;
        
        case 'Escape':
        case 'GoBack':
          // Handle TV remote back button
          if (onBack && onBack()) {
            e.preventDefault();
            // Custom back handler handled it
          }
          break;
          
        case 'Backspace':
          // Only prevent backspace if not in an input field
          if (document.activeElement?.tagName !== 'INPUT') {
            if (onBack && onBack()) {
              e.preventDefault();
            }
          }
          break;
        
        case 'MediaPlayPause':
          // Toggle video play/pause
          const video = document.querySelector('video');
          if (video) {
            e.preventDefault();
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }
          break;
        
        case 'MediaRewind':
          // Rewind 10 seconds
          const videoRew = document.querySelector('video');
          if (videoRew) {
            e.preventDefault();
            videoRew.currentTime = Math.max(0, videoRew.currentTime - 10);
          }
          break;
        
        case 'MediaFastForward':
          // Fast forward 10 seconds
          const videoFF = document.querySelector('video');
          if (videoFF) {
            e.preventDefault();
            videoFF.currentTime = Math.min(videoFF.duration, videoFF.currentTime + 10);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Handle hardware back button on Android
    let backButtonHandler: any;
    const setupBackButton = async () => {
      try {
        backButtonHandler = await App.addListener('backButton', () => {
          if (!onBack || !onBack()) {
            // No custom handler or it didn't handle it - exit app
            App.exitApp();
          }
        });
      } catch (err) {
        // Capacitor might not be available in browser
        console.log('Back button listener not available');
      }
    };
    setupBackButton();
    
    // Add focusable class to interactive elements
    const addFocusableElements = () => {
      const elements = document.querySelectorAll('button, input, a, .playlist-item, .playlist-card, video');
      elements.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '0');
        }
      });
      
      // Auto-focus video when it appears
      const video = document.querySelector('video');
      if (video && !document.querySelector('.playlist-container')) {
        setTimeout(() => {
          (video as HTMLElement).focus();
        }, 100);
      }
    };
    
    addFocusableElements();
    
    // Re-run when DOM changes
    const observer = new MutationObserver(addFocusableElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
      if (backButtonHandler) {
        backButtonHandler.remove();
      }
    };
  }, [onBack]);
}
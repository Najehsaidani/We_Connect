import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ChatlingScript: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if we're on an admin page
    const isAdminPage = location.pathname.includes('/acces/admin');
    
    // If we're on an admin page, don't add the script
    if (isAdminPage) {
      // Remove the script if it exists
      const existingScript = document.getElementById('chtl-script');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Remove the config if it exists
      const existingConfig = document.getElementById('chtl-config');
      if (existingConfig) {
        existingConfig.remove();
      }
      
      return;
    }
    
    // If we're not on an admin page, add the script
    // First, check if the script already exists
    if (!document.getElementById('chtl-script')) {
      // Add the config script
      const configScript = document.createElement('script');
      configScript.id = 'chtl-config';
      configScript.type = 'text/javascript';
      configScript.innerHTML = 'window.chtlConfig = { chatbotId: "2148528143" }';
      document.head.appendChild(configScript);
      
      // Add the main script
      const script = document.createElement('script');
      script.id = 'chtl-script';
      script.async = true;
      script.setAttribute('data-id', '2148528143');
      script.type = 'text/javascript';
      script.src = 'https://chatling.ai/js/embed.js';
      document.body.appendChild(script);
    }
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

export default ChatlingScript;

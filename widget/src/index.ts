/**
 * IntraMind Widget Entry Point
 * 
 * This is the main entry point for the embeddable widget.
 * It will be bundled into a single JavaScript file that can be
 * embedded in any website with a simple <script> tag.
 * 
 * Usage:
 * <script src="https://your-domain.com/intramind-widget.js"></script>
 * <script>
 *   IntraMind.init({
 *     apiKey: 'your-api-key',
 *     collection: 'company-docs'
 *   });
 * </script>
 */

import { render } from 'preact';
import App from './App';
import type { WidgetConfig } from './types';

// Global IntraMind object
const IntraMind = {
  /**
   * Initialize the IntraMind widget
   * @param config - Widget configuration
   */
  init(config: WidgetConfig) {
    console.log('IntraMind widget initializing...', config);
    
    // TODO: Validate configuration
    // TODO: Create Shadow DOM container
    // TODO: Render widget
    // TODO: Setup event listeners
    
    // Placeholder: Will be implemented in Phase 1
    console.log('Widget initialized with config:', config);
    
    // Mount the widget (temporary basic implementation)
    const container = document.createElement('div');
    container.id = 'intramind-widget-root';
    document.body.appendChild(container);
    
    render(<App config={config} />, container);
  },
  
  /**
   * Destroy the widget instance
   */
  destroy() {
    console.log('IntraMind widget destroying...');
    // TODO: Clean up widget, remove from DOM
  }
};

// Expose to global window object
declare global {
  interface Window {
    IntraMind: typeof IntraMind;
  }
}

window.IntraMind = IntraMind;

// Auto-init if data attributes are present (optional convenience)
document.addEventListener('DOMContentLoaded', () => {
  const script = document.querySelector('script[data-intramind-key]');
  if (script) {
    const apiKey = script.getAttribute('data-intramind-key');
    const collection = script.getAttribute('data-intramind-collection');
    
    if (apiKey) {
      IntraMind.init({
        apiKey,
        collection: collection || 'default'
      });
    }
  }
});

export default IntraMind;


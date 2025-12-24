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

// Widget instance state
let widgetInstance: {
  shadowRoot: ShadowRoot;
  container: HTMLElement;
  config: WidgetConfig;
} | null = null;

/**
 * Validate widget configuration
 */
function validateConfig(config: unknown): config is WidgetConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('IntraMind.init() requires a configuration object');
  }

  const cfg = config as Partial<WidgetConfig>;

  if (!cfg.apiKey || typeof cfg.apiKey !== 'string' || cfg.apiKey.trim() === '') {
    throw new Error('IntraMind.init() requires a valid apiKey');
  }

  // Validate optional fields
  if (cfg.position && !['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(cfg.position)) {
    throw new Error('Invalid position. Must be one of: bottom-right, bottom-left, top-right, top-left');
  }

  if (cfg.theme && !['light', 'dark', 'auto'].includes(cfg.theme)) {
    throw new Error('Invalid theme. Must be one of: light, dark, auto');
  }

  if (cfg.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(cfg.primaryColor)) {
    throw new Error('Invalid primaryColor. Must be a valid hex color (e.g., #4F46E5)');
  }

  return true;
}

/**
 * Create Shadow DOM container for style isolation
 */
function createShadowContainer(config: WidgetConfig): { shadowRoot: ShadowRoot; container: HTMLElement } {
  // Create host element
  const host = document.createElement('div');
  host.id = 'intramind-widget-host';
  host.setAttribute('data-intramind-widget', 'true');
  
  // Set position styles on host
  const position = config.position || 'bottom-right';
  const positionStyles: Record<string, string> = {
    position: 'fixed',
    zIndex: '9999',
    pointerEvents: 'none', // Allow clicks to pass through to shadow DOM
  };

  if (position.includes('bottom')) {
    positionStyles.bottom = '20px';
  } else {
    positionStyles.top = '20px';
  }

  if (position.includes('right')) {
    positionStyles.right = '20px';
  } else {
    positionStyles.left = '20px';
  }

  Object.assign(host.style, positionStyles);
  document.body.appendChild(host);

  // Create shadow root with open mode (allows debugging)
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Create container inside shadow DOM
  const container = document.createElement('div');
  container.id = 'intramind-widget-root';
  container.style.pointerEvents = 'auto'; // Re-enable pointer events inside shadow DOM
  shadowRoot.appendChild(container);

  // Inject base styles into shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    :host {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      box-sizing: border-box;
    }
    
    * {
      box-sizing: border-box;
    }
  `;
  shadowRoot.appendChild(style);

  return { shadowRoot, container };
}

// Global IntraMind object
const IntraMind = {
  /**
   * Initialize the IntraMind widget
   * @param config - Widget configuration
   */
  init(config: WidgetConfig) {
    // Prevent multiple initializations
    if (widgetInstance) {
      console.warn('IntraMind widget is already initialized. Call destroy() first to reinitialize.');
      return;
    }

    // Validate configuration
    if (!validateConfig(config)) {
      return;
    }

    // Set defaults
    const finalConfig: WidgetConfig = {
      apiKey: config.apiKey,
      collection: config.collection || 'default',
      position: config.position || 'bottom-right',
      theme: config.theme || 'light',
      primaryColor: config.primaryColor || '#4F46E5',
      features: {
        chat: config.features?.chat !== false,
        upload: config.features?.upload !== false,
        collections: config.features?.collections !== false,
      },
      placeholder: config.placeholder || 'Ask a question...',
      welcomeMessage: config.welcomeMessage || 'How can I help you?',
      apiUrl: config.apiUrl || 'http://localhost:8001',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
      allowedFileTypes: config.allowedFileTypes || ['pdf', 'docx', 'pptx', 'txt', 'md'],
    };

    try {
      // Create Shadow DOM container
      const { shadowRoot, container } = createShadowContainer(finalConfig);

      // Render widget inside shadow DOM
      render(<App config={finalConfig} />, container);

      // Store instance
      widgetInstance = {
        shadowRoot,
        container,
        config: finalConfig,
      };

      console.log('✅ IntraMind widget initialized successfully', finalConfig);
    } catch (error) {
      console.error('❌ Failed to initialize IntraMind widget:', error);
      throw error;
    }
  },
  
  /**
   * Destroy the widget instance
   */
  destroy() {
    if (!widgetInstance) {
      console.warn('IntraMind widget is not initialized');
      return;
    }

    try {
      // Unmount Preact component
      render(null, widgetInstance.container);

      // Remove shadow DOM host
      const host = widgetInstance.shadowRoot.host;
      if (host && host.parentNode) {
        host.parentNode.removeChild(host);
      }

      widgetInstance = null;
      console.log('✅ IntraMind widget destroyed');
    } catch (error) {
      console.error('❌ Error destroying IntraMind widget:', error);
    }
  },

  /**
   * Get current widget instance (for debugging)
   */
  getInstance() {
    return widgetInstance;
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


/**
 * Main Application Entry Point
 * Initializes and coordinates the Florida Civil Procedure visualization
 */

import { ChartRenderer } from './chart.js';
import { ControlsManager } from './controls.js';

/**
 * Main application class
 */
class App {
    constructor() {
        this.chart = null;
        this.controls = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing Florida Civil Procedure Visualization...');

            // Check for D3.js
            if (typeof d3 === 'undefined') {
                throw new Error('D3.js library not loaded');
            }

            // Initialize chart renderer
            this.chart = new ChartRenderer('chart');
            const chartSuccess = this.chart.initialize();

            if (!chartSuccess) {
                throw new Error('Failed to initialize chart');
            }

            // Initialize controls
            this.controls = new ControlsManager(this.chart);

            // Mark as initialized
            this.isInitialized = true;

            // Add fade-in animation
            document.querySelector('.container')?.classList.add('fade-in');

            console.log('Initialization complete!');

            // Announce to screen readers
            this.announceToScreenReader('Florida Civil Procedure workflow visualization loaded successfully');

            return true;
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showError(error.message);
            return false;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.innerHTML = `
                <strong>Error:</strong> ${message}
                <br><br>
                Please refresh the page and try again. If the problem persists, check the browser console for details.
            `;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.className = 'sr-only';
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = message;
        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => announcement.remove(), 1000);
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            chartReady: this.chart !== null,
            controlsReady: this.controls !== null
        };
    }
}

/**
 * Initialize application when DOM is ready
 */
function initializeApp() {
    const app = new App();

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.initialize());
    } else {
        app.initialize();
    }

    // Expose app instance globally for debugging
    window.floridaCivilProcedureApp = app;
}

// Start the application
initializeApp();

export default App;

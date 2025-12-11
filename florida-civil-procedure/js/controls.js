/**
 * Controls Module
 * Handles user interactions, search, export, and UI controls
 */

import { NODES } from './data.js';
import {
    debounce,
    searchNodes,
    exportToPNG,
    exportToSVG,
    setupKeyboardShortcuts,
    calculateStatistics
} from './utils.js';

export class ControlsManager {
    constructor(chartRenderer) {
        this.chart = chartRenderer;
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.querySelector('.search-results');
        this.currentSearchResults = [];

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateStatistics();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Zoom controls
        document.getElementById('resetZoom')?.addEventListener('click', () => {
            this.chart.resetZoom();
        });

        document.getElementById('zoomIn')?.addEventListener('click', () => {
            this.chart.zoomIn();
        });

        document.getElementById('zoomOut')?.addEventListener('click', () => {
            this.chart.zoomOut();
        });

        // Export controls
        document.getElementById('exportPNG')?.addEventListener('click', () => {
            this.exportChart('png');
        });

        document.getElementById('exportSVG')?.addEventListener('click', () => {
            this.exportChart('svg');
        });

        // Filter controls
        document.getElementById('showDocs')?.addEventListener('change', (e) => {
            this.chart.toggleLayer('documents');
        });

        document.getElementById('showDec')?.addEventListener('change', (e) => {
            this.chart.toggleLayer('decisions');
        });

        document.getElementById('showExc')?.addEventListener('change', (e) => {
            this.chart.toggleLayer('exceptions');
        });

        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            this.searchInput.addEventListener('focus', () => {
                if (this.currentSearchResults.length > 0) {
                    this.searchResults.classList.add('active');
                }
            });

            // Close search results on click outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.searchResults.classList.remove('active');
                }
            });
        }

        // Clear highlights on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.chart.clearHighlights();
                if (this.searchInput) {
                    this.searchInput.value = '';
                    this.searchResults.classList.remove('active');
                }
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        setupKeyboardShortcuts({
            'r': () => this.chart.resetZoom(),
            '+': () => this.chart.zoomIn(),
            '=': () => this.chart.zoomIn(),
            '-': () => this.chart.zoomOut(),
            '/': () => {
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            },
            'd': () => {
                const checkbox = document.getElementById('showDocs');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.chart.toggleLayer('documents');
                }
            },
            'e': () => {
                const checkbox = document.getElementById('showExc');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.chart.toggleLayer('exceptions');
                }
            },
            '?': () => this.showHelp(),
            'escape': () => {
                this.chart.clearHighlights();
            }
        });
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.currentSearchResults = [];
            this.searchResults.classList.remove('active');
            this.renderSearchResults();
            return;
        }

        this.currentSearchResults = searchNodes(NODES, query);
        this.renderSearchResults();

        if (this.currentSearchResults.length > 0) {
            this.searchResults.classList.add('active');
        } else {
            this.searchResults.classList.remove('active');
        }
    }

    /**
     * Render search results
     */
    renderSearchResults() {
        if (this.currentSearchResults.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            return;
        }

        const html = this.currentSearchResults.map(node => {
            const name = node.name.replace(/\n/g, ' ');
            const meta = [node.rule, node.stage, node.owner].filter(Boolean).join(' • ');

            return `
                <div class="search-result-item" data-node-id="${node.id}" role="button" tabindex="0">
                    <div class="search-result-name">${name}</div>
                    <div class="search-result-meta">${meta}</div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = html;

        // Add click handlers to results
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            const nodeId = parseInt(item.dataset.nodeId);

            const handleSelect = () => {
                this.chart.highlightNodeAndPaths(nodeId);
                this.searchResults.classList.remove('active');
                if (this.searchInput) {
                    this.searchInput.blur();
                }
            };

            item.addEventListener('click', handleSelect);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleSelect();
                }
            });
        });
    }

    /**
     * Export chart
     */
    exportChart(format) {
        const svgElement = this.chart.getSVGElement();

        if (!svgElement) {
            alert('Unable to export chart. Please try again.');
            return;
        }

        try {
            if (format === 'png') {
                exportToPNG(svgElement, 'florida-civil-procedure.png');
            } else if (format === 'svg') {
                exportToSVG(svgElement, 'florida-civil-procedure.svg');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = calculateStatistics(NODES, []);
        const statsContainer = document.querySelector('.stats');

        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${stats.totalNodes}</span>
                    <span>Total Steps</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.decisionPoints}</span>
                    <span>Decision Points</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.exceptionPaths}</span>
                    <span>Exception Paths</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.strictDeadlines}</span>
                    <span>Strict Deadlines</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.stages}</span>
                    <span>Process Stages</span>
                </div>
            `;
        }
    }

    /**
     * Show help modal
     */
    showHelp() {
        const helpContent = `
            <h3>Florida Civil Procedure Workflow</h3>
            <p>This interactive diagram shows the complete workflow of civil litigation in Florida.</p>

            <h4>Navigation:</h4>
            <ul>
                <li><strong>Pan:</strong> Click and drag on the canvas</li>
                <li><strong>Zoom:</strong> Use mouse wheel, zoom buttons, or keyboard shortcuts (+/-)</li>
                <li><strong>Search:</strong> Use the search box or press "/" to find specific steps</li>
                <li><strong>Click nodes:</strong> Click any node to highlight it and pan to it</li>
            </ul>

            <h4>Keyboard Shortcuts:</h4>
            <ul>
                <li><kbd>R</kbd> - Reset view</li>
                <li><kbd>+</kbd> or <kbd>=</kbd> - Zoom in</li>
                <li><kbd>-</kbd> - Zoom out</li>
                <li><kbd>/</kbd> - Focus search</li>
                <li><kbd>D</kbd> - Toggle documents</li>
                <li><kbd>E</kbd> - Toggle exceptions</li>
                <li><kbd>ESC</kbd> - Clear highlights</li>
                <li><kbd>?</kbd> - Show this help</li>
            </ul>

            <h4>Legend:</h4>
            <ul>
                <li><strong>Red Border:</strong> Strict statutory deadlines</li>
                <li><strong>Yellow Diamond:</strong> Decision points</li>
                <li><strong>Blue Icon:</strong> Required documents (hover to see list)</li>
                <li><strong>Dashed Red Line:</strong> Exception/error paths</li>
            </ul>
        `;

        // Simple alert for now - could be enhanced with a modal
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = helpContent;
        alert(tempDiv.textContent);
    }

    /**
     * Show loading state
     */
    showLoading() {
        const chart = document.getElementById('chart');
        if (chart) {
            chart.innerHTML = '<div class="loading">Loading visualization</div>';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
}

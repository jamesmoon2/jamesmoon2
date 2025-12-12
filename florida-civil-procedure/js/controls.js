/**
 * Controls Module
 * Handles user interactions, search, export, and UI controls
 */

import { NODES, PHASE_GROUPS } from './data.js';
import {
    debounce,
    searchNodes,
    exportToPNG,
    exportToSVG,
    setupKeyboardShortcuts,
    calculateStatistics,
    calculateCostEstimates,
    formatCurrency
} from './utils.js';

export class ControlsManager {
    constructor(chartRenderer) {
        this.chart = chartRenderer;
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.querySelector('.search-results');
        this.currentSearchResults = [];

        // Cost estimator state
        this.attorneyFeesEnabled = false;
        this.selectionModeEnabled = false;
        this.costSidebar = document.getElementById('costSidebar');

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupPhaseFilters();
        this.setupCostEstimatorListeners();
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
     * Setup phase filter toggles
     */
    setupPhaseFilters() {
        const phaseTogglesContainer = document.getElementById('phaseToggles');
        if (!phaseTogglesContainer) return;

        // Render phase toggle buttons
        const phaseVisibility = this.chart.getPhaseVisibility();

        Object.entries(PHASE_GROUPS).forEach(([phaseId, phase]) => {
            const nodeCount = this.chart.getPhaseNodeCount(phaseId);
            const isActive = phaseVisibility[phaseId];

            const toggle = document.createElement('button');
            toggle.className = `phase-toggle ${isActive ? 'active' : ''}`;
            toggle.dataset.phaseId = phaseId;
            toggle.setAttribute('aria-pressed', isActive);
            toggle.setAttribute('aria-label', `${phase.name}: ${phase.description}`);
            toggle.title = phase.description;

            toggle.innerHTML = `
                <span class="phase-toggle-icon">${phase.icon}</span>
                <span class="phase-toggle-name">${phase.shortName}</span>
                <span class="phase-toggle-count">${nodeCount}</span>
            `;

            toggle.addEventListener('click', () => {
                this.handlePhaseToggle(phaseId, toggle);
            });

            phaseTogglesContainer.appendChild(toggle);
        });

        // Setup "All" and "None" buttons
        document.getElementById('showAllPhases')?.addEventListener('click', () => {
            this.setAllPhasesVisible(true);
        });

        document.getElementById('hideAllPhases')?.addEventListener('click', () => {
            this.setAllPhasesVisible(false);
        });
    }

    /**
     * Handle phase toggle click
     */
    handlePhaseToggle(phaseId, toggleElement) {
        this.chart.togglePhase(phaseId);

        const isActive = this.chart.getPhaseVisibility()[phaseId];
        toggleElement.classList.toggle('active', isActive);
        toggleElement.setAttribute('aria-pressed', isActive);
    }

    /**
     * Set all phases visible or hidden
     */
    setAllPhasesVisible(visible) {
        this.chart.setAllPhasesVisibility(visible);

        // Update all toggle button states
        document.querySelectorAll('.phase-toggle').forEach(toggle => {
            toggle.classList.toggle('active', visible);
            toggle.setAttribute('aria-pressed', visible);
        });
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

    // ============================================
    // COST ESTIMATOR METHODS
    // ============================================

    /**
     * Setup cost estimator event listeners
     */
    setupCostEstimatorListeners() {
        // Attorney Fees Toggle
        document.getElementById('enableAttorneyFees')?.addEventListener('change', (e) => {
            this.handleAttorneyFeesToggle(e.target.checked);
        });

        // Hourly Rate Input
        document.getElementById('hourlyRate')?.addEventListener('input', debounce((e) => {
            this.handleHourlyRateChange(parseInt(e.target.value, 10) || 0);
        }, 300));

        // Selection Mode Toggle
        document.getElementById('enableSelectionMode')?.addEventListener('change', (e) => {
            this.handleSelectionModeToggle(e.target.checked);
        });

        // Clear Selections Button
        document.getElementById('clearSelections')?.addEventListener('click', () => {
            this.handleClearSelections();
        });

        // Sidebar Toggle
        document.getElementById('toggleSidebar')?.addEventListener('click', () => {
            this.handleSidebarToggle();
        });

        // Also allow clicking the header to expand when collapsed
        const sidebarHeader = document.querySelector('.cost-sidebar-header');
        sidebarHeader?.addEventListener('click', (e) => {
            // Only expand if sidebar is collapsed and click wasn't on the toggle button
            if (this.costSidebar?.classList.contains('collapsed') &&
                !e.target.closest('.sidebar-toggle')) {
                this.handleSidebarToggle();
            }
        });

        // Listen for cost update events from ChartRenderer
        document.addEventListener('costEstimatorUpdate', (e) => {
            this.updateCostEstimates(e.detail.selectedNodes);
        });
    }

    /**
     * Handle attorney fees toggle
     * @param {boolean} enabled - Whether attorney fees calculation is enabled
     */
    handleAttorneyFeesToggle(enabled) {
        this.attorneyFeesEnabled = enabled;

        // Show/hide hourly rate input
        const hourlyRateContainer = document.getElementById('hourlyRateContainer');
        const attorneyFeesRow = document.getElementById('attorneyFeesRow');

        if (hourlyRateContainer) {
            hourlyRateContainer.style.display = enabled ? 'flex' : 'none';
        }
        if (attorneyFeesRow) {
            attorneyFeesRow.style.display = enabled ? 'flex' : 'none';
        }

        // Update calculations with current selections
        this.updateCostEstimates(this.chart.getSelectedNodes());
    }

    /**
     * Handle hourly rate change
     * @param {number} rate - New hourly rate
     */
    handleHourlyRateChange(rate) {
        this.chart.setAttorneyHourlyRate(rate);
        this.updateCostEstimates(this.chart.getSelectedNodes());
    }

    /**
     * Handle selection mode toggle
     * @param {boolean} enabled - Whether selection mode is enabled
     */
    handleSelectionModeToggle(enabled) {
        this.selectionModeEnabled = enabled;
        this.chart.toggleCostEstimatorMode();

        // Show/hide clear selections button
        const clearBtn = document.getElementById('clearSelections');
        if (clearBtn) {
            clearBtn.style.display = enabled ? 'inline-flex' : 'none';
        }

        // Show/hide sidebar
        if (this.costSidebar) {
            this.costSidebar.classList.toggle('visible', enabled);
        }

        // Update cursor style on chart
        const chart = document.getElementById('chart');
        if (chart) {
            chart.classList.toggle('selection-mode', enabled);
        }
    }

    /**
     * Handle clear selections
     */
    handleClearSelections() {
        this.chart.clearNodeSelections();
        this.updateCostEstimates([]);
    }

    /**
     * Handle sidebar toggle (collapse/expand)
     */
    handleSidebarToggle() {
        this.chart.toggleSidebar();

        if (this.costSidebar) {
            this.costSidebar.classList.toggle('collapsed');
        }

        // Update toggle icon direction
        const toggleIcon = document.querySelector('.collapse-icon');
        if (toggleIcon) {
            toggleIcon.textContent = this.chart.isSidebarCollapsed() ? '\u25C0' : '\u25B6';
        }
    }

    /**
     * Update cost estimates display in sidebar
     * @param {Array} selectedNodes - Array of selected node objects
     */
    updateCostEstimates(selectedNodes) {
        const hourlyRate = this.attorneyFeesEnabled ? this.chart.getAttorneyHourlyRate() : 0;
        const estimates = calculateCostEstimates(selectedNodes, hourlyRate);

        // Update summary values
        const stepsCount = document.getElementById('selectedStepsCount');
        const daysEstimate = document.getElementById('totalDaysEstimate');
        const fixedCosts = document.getElementById('totalFixedCosts');
        const attorneyHours = document.getElementById('totalAttorneyHours');
        const attorneyFees = document.getElementById('totalAttorneyFees');
        const grandTotal = document.getElementById('grandTotal');

        if (stepsCount) {
            stepsCount.textContent = selectedNodes.length;
        }

        if (daysEstimate) {
            if (estimates.daysMin === estimates.daysMax) {
                daysEstimate.textContent = `${estimates.daysMin} days`;
            } else {
                daysEstimate.textContent = `${estimates.daysMin} - ${estimates.daysMax} days`;
            }
        }

        if (fixedCosts) {
            fixedCosts.textContent = formatCurrency(estimates.fixedCostsMin, estimates.fixedCostsMax);
        }

        if (attorneyHours) {
            if (estimates.hoursMin === estimates.hoursMax) {
                attorneyHours.textContent = `${estimates.hoursMin} hrs`;
            } else {
                attorneyHours.textContent = `${estimates.hoursMin} - ${estimates.hoursMax} hrs`;
            }
        }

        if (attorneyFees && this.attorneyFeesEnabled) {
            attorneyFees.textContent = formatCurrency(estimates.attorneyFeesMin, estimates.attorneyFeesMax);
        }

        if (grandTotal) {
            grandTotal.textContent = formatCurrency(estimates.totalMin, estimates.totalMax);
        }

        // Update selected nodes list
        this.updateSelectedNodesList(selectedNodes);
    }

    /**
     * Update selected nodes list in sidebar
     * @param {Array} selectedNodes - Array of selected node objects
     */
    updateSelectedNodesList(selectedNodes) {
        const listEl = document.getElementById('selectedNodesUl');
        if (!listEl) return;

        if (selectedNodes.length === 0) {
            listEl.innerHTML = '<li class="no-selection">No steps selected. Enable Selection Mode and click nodes to add them.</li>';
            return;
        }

        listEl.innerHTML = selectedNodes.map(node => {
            const name = node.name.replace(/\n/g, ' ');
            return `
                <li class="selected-node-item" data-node-id="${node.id}">
                    <span class="node-name">${name}</span>
                    <span class="node-cost">${node.cost || 'n/a'}</span>
                    <button class="remove-node-btn" aria-label="Remove ${name} from selection">
                        &times;
                    </button>
                </li>
            `;
        }).join('');

        // Add remove button handlers
        listEl.querySelectorAll('.remove-node-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeId = parseInt(e.target.closest('li').dataset.nodeId, 10);
                this.chart.deselectNode(nodeId);
            });
        });
    }
}

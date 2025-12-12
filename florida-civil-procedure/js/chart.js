/**
 * Chart Rendering Module
 * Handles D3.js visualization of the Florida Civil Procedure workflow
 * Enhanced with expandable node groups and parallel process indicators
 */

import { NODES, LINKS, STAGE_COLORS, CONFIG, NODE_GROUPS, PARALLEL_PROCESSES, PHASE_GROUPS } from './data.js';
import {
    generateCurvePath,
    formatTooltip,
    formatLinkTooltip,
    highlightNode
} from './utils.js';

export class ChartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.g = null;
        this.zoom = null;
        this.tooltip = document.querySelector('.tooltip');

        // Layer groups
        this.linkGroup = null;
        this.exceptionGroup = null;
        this.parallelGroup = null;
        this.nodeGroup = null;
        this.documentGroup = null;
        this.decisionGroup = null;
        this.expandableGroup = null;

        // State
        this.visibility = {
            documents: true,
            decisions: true,
            exceptions: true,
            parallelProcesses: true
        };

        // Phase visibility state - all phases enabled by default
        this.phaseVisibility = {};
        Object.keys(PHASE_GROUPS).forEach(key => {
            this.phaseVisibility[key] = PHASE_GROUPS[key].enabled;
        });

        // Build stage-to-phase lookup for efficient filtering
        this.stageToPhase = {};
        Object.entries(PHASE_GROUPS).forEach(([phaseId, phase]) => {
            phase.stages.forEach(stage => {
                this.stageToPhase[stage] = phaseId;
            });
        });

        // Node group expansion state
        this.groupExpansion = {};
        Object.keys(NODE_GROUPS).forEach(key => {
            this.groupExpansion[key] = NODE_GROUPS[key].expanded;
        });

        this.highlightedNodeId = null;
        this.highlightedPath = [];

        // Create node lookup map for efficient access
        this.nodeMap = new Map();
        NODES.forEach(node => this.nodeMap.set(node.id, node));
    }

    /**
     * Initialize the chart
     */
    initialize() {
        try {
            this.createSVG();
            this.setupZoom();
            this.createLayers();
            this.renderParallelProcessIndicator();
            this.renderLinks();
            this.renderNodes();
            this.applyInitialZoom();
            return true;
        } catch (error) {
            console.error('Failed to initialize chart:', error);
            this.showError('Failed to load visualization. Please refresh the page.');
            return false;
        }
    }

    /**
     * Create SVG element
     */
    createSVG() {
        const { width, height } = CONFIG.chart;

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, width, height])
            .attr('aria-label', 'Florida Civil Procedure Workflow Diagram')
            .attr('role', 'img');

        this.g = this.svg.append('g');
    }

    /**
     * Setup zoom and pan behavior
     */
    setupZoom() {
        const { minZoom, maxZoom } = CONFIG.chart;

        this.zoom = d3.zoom()
            .scaleExtent([minZoom, maxZoom])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);
    }

    /**
     * Create layer groups for organized rendering
     */
    createLayers() {
        this.parallelGroup = this.g.append('g').attr('class', 'parallel-processes');
        this.linkGroup = this.g.append('g').attr('class', 'links');
        this.exceptionGroup = this.g.append('g').attr('class', 'exceptions');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        this.documentGroup = this.g.append('g').attr('class', 'documents');
        this.decisionGroup = this.g.append('g').attr('class', 'decisions');
        this.expandableGroup = this.g.append('g').attr('class', 'expandables');
    }

    /**
     * Render parallel process indicator (mediation, settlement available any time)
     */
    renderParallelProcessIndicator() {
        // Create a sidebar indicator showing parallel processes
        const parallelBox = this.parallelGroup.append('g')
            .attr('class', 'parallel-indicator')
            .attr('transform', 'translate(50, 100)');

        // Background
        parallelBox.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 160)
            .attr('height', 180)
            .attr('rx', 8)
            .attr('fill', 'rgba(34, 197, 94, 0.1)')
            .attr('stroke', '#22c55e')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');

        // Title
        parallelBox.append('text')
            .attr('x', 80)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', '700')
            .style('fill', '#16a34a')
            .text('AVAILABLE ANYTIME');

        // Parallel processes
        PARALLEL_PROCESSES.forEach((process, index) => {
            const yPos = 45 + index * 45;

            const processGroup = parallelBox.append('g')
                .attr('transform', `translate(10, ${yPos})`)
                .style('cursor', 'pointer')
                .on('mouseover', (event) => this.showParallelTooltip(event, process))
                .on('mouseout', () => this.hideTooltip());

            processGroup.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 140)
                .attr('height', 35)
                .attr('rx', 4)
                .attr('fill', STAGE_COLORS[process.stage] || '#22c55e')
                .attr('opacity', 0.9);

            processGroup.append('text')
                .attr('x', 70)
                .attr('y', 14)
                .attr('text-anchor', 'middle')
                .style('font-size', '9px')
                .style('font-weight', '600')
                .style('fill', '#fff')
                .text(process.name);

            processGroup.append('text')
                .attr('x', 70)
                .attr('y', 26)
                .attr('text-anchor', 'middle')
                .style('font-size', '8px')
                .style('fill', 'rgba(255,255,255,0.8)')
                .text(process.rule);
        });
    }

    /**
     * Show tooltip for parallel process
     */
    showParallelTooltip(event, process) {
        let html = `<strong>${process.name}</strong>`;
        html += `<div class="section"><div class="label">Rule</div>${process.rule}</div>`;
        html += `<div class="section"><div class="label">Description</div>${process.description}</div>`;

        if (process.timing) {
            html += `<div class="section"><div class="label">Timing</div>`;
            html += `<div>Earliest: ${process.timing.earliest}</div>`;
            html += `<div>Latest: ${process.timing.latest}</div></div>`;
        }

        this.showTooltip(event, html);
    }

    /**
     * Render all links (connections between nodes)
     */
    renderLinks() {
        LINKS.forEach(link => {
            const sourceNode = this.nodeMap.get(link.source);
            const targetNode = this.nodeMap.get(link.target);

            if (!sourceNode || !targetNode) {
                console.warn(`Invalid link: ${link.source} -> ${link.target}`);
                return;
            }

            // Check if this link involves collapsed or hidden nodes
            const sourceHidden = !this.shouldRenderNode(sourceNode);
            const targetHidden = !this.shouldRenderNode(targetNode);

            const group = link.isException ? this.exceptionGroup : this.linkGroup;
            let pathClass = link.isException ? 'link exception-path' : 'link';

            // Add parallel class for proposal for settlement links
            if (link.isParallel) {
                pathClass += ' parallel-link';
            }

            const path = group.append('path')
                .attr('class', pathClass)
                .attr('data-link-id', `${link.source}-${link.target}`)
                .attr('data-source', link.source)
                .attr('data-target', link.target)
                .attr('d', generateCurvePath(sourceNode, targetNode))
                .attr('stroke', link.isException ? '#dc2626' : (link.isParallel ? '#84cc16' : STAGE_COLORS[sourceNode.stage]))
                .attr('stroke-width', Math.max(1, link.volume / 5))
                .style('display', (sourceHidden || targetHidden) ? 'none' : 'block')
                .on('mouseover', (event) => this.handleLinkHover(event, link, sourceNode, targetNode))
                .on('mouseout', () => this.handleLinkOut());
        });
    }

    /**
     * Check if a node is currently collapsed (part of a collapsed group)
     */
    isNodeCollapsed(node) {
        if (!node.group) return false;
        return !this.groupExpansion[node.group];
    }

    /**
     * Check if a node's phase is currently hidden
     */
    isNodePhaseHidden(node) {
        const phaseId = this.stageToPhase[node.stage];
        if (!phaseId) return false;
        return !this.phaseVisibility[phaseId];
    }

    /**
     * Check if a node should be rendered (considering both group collapse and phase visibility)
     */
    shouldRenderNode(node) {
        // Don't render if node is in a collapsed group
        if (this.isNodeCollapsed(node)) return false;
        // Don't render if node's phase is hidden
        if (this.isNodePhaseHidden(node)) return false;
        return true;
    }

    /**
     * Render all nodes
     */
    renderNodes() {
        NODES.forEach(node => {
            // Skip rendering if node shouldn't be shown
            if (!this.shouldRenderNode(node)) {
                return;
            }
            this.renderNode(node);
        });
    }

    /**
     * Render a single node with all its components
     * @param {Object} node - Node data
     */
    renderNode(node) {
        // Render decision diamond if applicable
        if (node.isDecision && this.visibility.decisions) {
            this.renderDecisionDiamond(node);
        }

        // Create node group
        const nodeGroup = this.nodeGroup.append('g')
            .attr('class', `node ${node.deadline === 'strict' ? 'deadline-strict' : ''} ${node.isExpandable ? 'expandable-node' : ''} ${node.group ? `group-${node.group}` : ''}`)
            .attr('data-node-id', node.id)
            .attr('transform', `translate(${node.x}, ${node.y})`)
            .attr('aria-label', `${node.name.replace(/\n/g, ' ')} - ${node.rule || 'No rule'}`);

        // Calculate height based on text lines
        const lines = node.name.split('\n');
        const rectHeight = lines.length > 1 ?
            CONFIG.node.multiLineHeight :
            CONFIG.node.singleLineHeight;

        // Main rectangle
        const rect = nodeGroup.append('rect')
            .attr('x', 0)
            .attr('y', -rectHeight / 2)
            .attr('width', CONFIG.node.width)
            .attr('height', rectHeight)
            .attr('fill', STAGE_COLORS[node.stage])
            .attr('rx', CONFIG.node.borderRadius)
            .on('mouseover', (event) => this.handleNodeHover(event, node))
            .on('mouseout', () => this.handleNodeOut())
            .on('click', () => this.handleNodeClick(node));

        // Add expandable indicator if applicable
        if (node.isExpandable) {
            this.renderExpandableIndicator(nodeGroup, node, rectHeight);
        }

        // Node text (name)
        lines.forEach((line, i) => {
            nodeGroup.append('text')
                .attr('x', node.isExpandable ? 30 : 24)
                .attr('y', lines.length > 1 ? -12 + i * 12 : -4)
                .attr('dy', '0.35em')
                .style('font-size', '10px')
                .text(line);
        });

        // Rule reference
        if (node.rule) {
            nodeGroup.append('text')
                .attr('x', node.isExpandable ? 30 : 24)
                .attr('y', lines.length > 1 ? 6 : 6)
                .style('font-size', '8px')
                .style('fill', '#64748b')
                .text(node.rule);
        }

        // Duration
        if (node.duration && node.duration !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', node.isExpandable ? 30 : 24)
                .attr('y', lines.length > 1 ? 16 : 16)
                .style('font-size', '8px')
                .style('fill', '#7c3aed')
                .text(`⏱ ${node.duration}`);
        }

        // Cost
        if (node.cost && node.cost !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', node.isExpandable ? 30 : 24)
                .attr('y', lines.length > 1 ? 26 : 26)
                .style('font-size', '8px')
                .style('fill', '#059669')
                .text(`💰 ${node.cost}`);
        }

        // Owner
        if (node.owner && node.owner !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', node.isExpandable ? 30 : 24)
                .attr('y', -rectHeight / 2 - 4)
                .style('font-size', '8px')
                .style('fill', '#e11d48')
                .style('font-weight', '700')
                .text(`👤 ${node.owner}`);
        }

        // Document icon
        if (node.documents && node.documents.length > 0 && this.visibility.documents) {
            this.renderDocumentIcon(node, rectHeight);
        }
    }

    /**
     * Render expandable indicator (plus/minus button)
     */
    renderExpandableIndicator(nodeGroup, node, rectHeight) {
        const isExpanded = this.groupExpansion[node.expandsGroup];
        const indicator = nodeGroup.append('g')
            .attr('class', 'expand-indicator')
            .attr('transform', `translate(6, 0)`)
            .style('cursor', 'pointer')
            .on('click', (event) => {
                event.stopPropagation();
                this.toggleGroup(node.expandsGroup);
            });

        indicator.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 8)
            .attr('fill', '#fff')
            .attr('stroke', STAGE_COLORS[node.stage])
            .attr('stroke-width', 2);

        indicator.append('text')
            .attr('x', 0)
            .attr('y', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '700')
            .style('fill', STAGE_COLORS[node.stage])
            .style('pointer-events', 'none')
            .text(isExpanded ? '−' : '+');
    }

    /**
     * Toggle a node group expansion
     */
    toggleGroup(groupId) {
        this.groupExpansion[groupId] = !this.groupExpansion[groupId];
        this.refresh();
    }

    /**
     * Refresh the entire chart (for group expansion/collapse)
     */
    refresh() {
        // Clear all rendered elements
        this.linkGroup.selectAll('*').remove();
        this.exceptionGroup.selectAll('*').remove();
        this.nodeGroup.selectAll('*').remove();
        this.documentGroup.selectAll('*').remove();
        this.decisionGroup.selectAll('*').remove();
        this.expandableGroup.selectAll('*').remove();

        // Re-render
        this.renderLinks();
        this.renderNodes();
    }

    /**
     * Render decision diamond
     * @param {Object} node - Node data
     */
    renderDecisionDiamond(node) {
        const { size } = CONFIG.decision;

        this.decisionGroup.append('polygon')
            .attr('class', 'decision-diamond')
            .attr('data-decision-id', node.id)
            .attr('points', `${node.x},${node.y - size} ${node.x + size},${node.y} ${node.x},${node.y + size} ${node.x - size},${node.y}`)
            .on('mouseover', (event) => this.handleNodeHover(event, node))
            .on('mouseout', () => this.handleNodeOut())
            .on('click', () => this.handleNodeClick(node));
    }

    /**
     * Render document icon
     * @param {Object} node - Node data
     * @param {number} rectHeight - Height of node rectangle
     */
    renderDocumentIcon(node, rectHeight) {
        const { width, height, offsetY } = CONFIG.document;

        this.documentGroup.append('rect')
            .attr('class', 'document-icon')
            .attr('data-doc-id', node.id)
            .attr('x', node.x + 22)
            .attr('y', node.y + rectHeight / 2 + offsetY)
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 2)
            .on('mouseover', (event) => this.handleDocumentHover(event, node))
            .on('mouseout', () => this.handleNodeOut());
    }

    /**
     * Handle node hover
     */
    handleNodeHover(event, node) {
        this.showTooltip(event, formatTooltip(node));
    }

    /**
     * Handle link hover
     */
    handleLinkHover(event, link, sourceNode, targetNode) {
        d3.select(event.target).style('stroke-opacity', 0.7);
        this.showTooltip(event, formatLinkTooltip(link, sourceNode, targetNode));
    }

    /**
     * Handle document icon hover
     */
    handleDocumentHover(event, node) {
        const html = `<strong>Required Documents</strong>
                      <div class="section">${node.documents.map(doc => `• ${doc}`).join('<br/>')}</div>`;
        this.showTooltip(event, html);
    }

    /**
     * Handle mouse out from node/link
     */
    handleNodeOut() {
        this.hideTooltip();
    }

    /**
     * Handle link mouse out
     */
    handleLinkOut() {
        d3.selectAll('.link').style('stroke-opacity', 0.25);
        this.hideTooltip();
    }

    /**
     * Handle node click
     */
    handleNodeClick(node) {
        // If expandable, toggle expansion
        if (node.isExpandable) {
            this.toggleGroup(node.expandsGroup);
        } else {
            this.highlightNodeAndPaths(node.id);
        }
    }

    /**
     * Show tooltip
     */
    showTooltip(event, html) {
        this.tooltip.innerHTML = html;
        this.tooltip.style.opacity = '1';
        this.tooltip.style.left = `${event.pageX + 15}px`;
        this.tooltip.style.top = `${event.pageY - 15}px`;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    /**
     * Highlight a specific node and its paths
     */
    highlightNodeAndPaths(nodeId) {
        // Remove previous highlights
        this.clearHighlights();

        // Highlight the node
        const nodeElement = this.nodeGroup.select(`[data-node-id="${nodeId}"]`);
        if (nodeElement.empty()) return;

        nodeElement.classed('node-highlight', true);
        this.highlightedNodeId = nodeId;

        // Scroll to node (smooth pan to node)
        const node = this.nodeMap.get(nodeId);
        if (node) {
            this.panToNode(node);
        }
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.nodeGroup.selectAll('.node-highlight').classed('node-highlight', false);
        this.linkGroup.selectAll('.link-highlight').classed('link-highlight', false);
        this.highlightedNodeId = null;
        this.highlightedPath = [];
    }

    /**
     * Pan to a specific node
     */
    panToNode(node) {
        const scale = 0.8;
        const { width, height } = CONFIG.chart;
        const x = width / 2 - node.x * scale;
        const y = height / 2 - node.y * scale;

        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(x, y).scale(scale)
            );
    }

    /**
     * Toggle visibility of a layer
     */
    toggleLayer(layerName) {
        this.visibility[layerName] = !this.visibility[layerName];

        const display = this.visibility[layerName] ? 'block' : 'none';

        switch (layerName) {
            case 'documents':
                this.documentGroup.style('display', display);
                break;
            case 'decisions':
                this.decisionGroup.style('display', display);
                break;
            case 'exceptions':
                this.exceptionGroup.style('display', display);
                break;
            case 'parallelProcesses':
                this.parallelGroup.style('display', display);
                break;
        }
    }

    /**
     * Toggle visibility of a phase
     * @param {string} phaseId - Phase identifier
     */
    togglePhase(phaseId) {
        if (this.phaseVisibility.hasOwnProperty(phaseId)) {
            this.phaseVisibility[phaseId] = !this.phaseVisibility[phaseId];
            this.refresh();
        }
    }

    /**
     * Set visibility of a specific phase
     * @param {string} phaseId - Phase identifier
     * @param {boolean} visible - Whether the phase should be visible
     */
    setPhaseVisibility(phaseId, visible) {
        if (this.phaseVisibility.hasOwnProperty(phaseId)) {
            this.phaseVisibility[phaseId] = visible;
            this.refresh();
        }
    }

    /**
     * Set visibility of all phases at once
     * @param {boolean} visible - Whether all phases should be visible
     */
    setAllPhasesVisibility(visible) {
        Object.keys(this.phaseVisibility).forEach(key => {
            this.phaseVisibility[key] = visible;
        });
        this.refresh();
    }

    /**
     * Get current phase visibility state
     * @returns {Object} - Map of phase IDs to visibility state
     */
    getPhaseVisibility() {
        return { ...this.phaseVisibility };
    }

    /**
     * Get count of visible nodes for a phase
     * @param {string} phaseId - Phase identifier
     * @returns {number} - Count of visible nodes
     */
    getPhaseNodeCount(phaseId) {
        const phase = PHASE_GROUPS[phaseId];
        if (!phase) return 0;
        return NODES.filter(node => phase.stages.includes(node.stage)).length;
    }

    /**
     * Get all group expansion states
     */
    getGroupExpansionState() {
        return { ...this.groupExpansion };
    }

    /**
     * Set all groups to expanded or collapsed
     */
    setAllGroupsExpanded(expanded) {
        Object.keys(this.groupExpansion).forEach(key => {
            this.groupExpansion[key] = expanded;
        });
        this.refresh();
    }

    /**
     * Reset zoom to initial view
     */
    resetZoom() {
        const { initialZoom } = CONFIG.chart;
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity.scale(initialZoom).translate(50, 50)
            );
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.svg.transition()
            .duration(300)
            .call(this.zoom.scaleBy, 1.3);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.svg.transition()
            .duration(300)
            .call(this.zoom.scaleBy, 0.7);
    }

    /**
     * Apply initial zoom
     */
    applyInitialZoom() {
        const { initialZoom } = CONFIG.chart;
        setTimeout(() => {
            this.svg.call(
                this.zoom.transform,
                d3.zoomIdentity.scale(initialZoom).translate(50, 50)
            );
        }, 100);
    }

    /**
     * Get SVG element for export
     */
    getSVGElement() {
        return this.svg.node();
    }

    /**
     * Show error message
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error" role="alert">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

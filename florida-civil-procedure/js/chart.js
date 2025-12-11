/**
 * Chart Rendering Module
 * Handles D3.js visualization of the Florida Civil Procedure workflow
 */

import { NODES, LINKS, STAGE_COLORS, CONFIG } from './data.js';
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
        this.nodeGroup = null;
        this.documentGroup = null;
        this.decisionGroup = null;

        // State
        this.visibility = {
            documents: true,
            decisions: true,
            exceptions: true
        };

        this.highlightedNodeId = null;
        this.highlightedPath = [];
    }

    /**
     * Initialize the chart
     */
    initialize() {
        try {
            this.createSVG();
            this.setupZoom();
            this.createLayers();
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
        this.linkGroup = this.g.append('g').attr('class', 'links');
        this.exceptionGroup = this.g.append('g').attr('class', 'exceptions');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        this.documentGroup = this.g.append('g').attr('class', 'documents');
        this.decisionGroup = this.g.append('g').attr('class', 'decisions');
    }

    /**
     * Render all links (connections between nodes)
     */
    renderLinks() {
        LINKS.forEach(link => {
            const sourceNode = NODES[link.source];
            const targetNode = NODES[link.target];

            if (!sourceNode || !targetNode) {
                console.warn(`Invalid link: ${link.source} -> ${link.target}`);
                return;
            }

            const group = link.isException ? this.exceptionGroup : this.linkGroup;
            const pathClass = link.isException ? 'link exception-path' : 'link';

            const path = group.append('path')
                .attr('class', pathClass)
                .attr('data-link-id', `${link.source}-${link.target}`)
                .attr('d', generateCurvePath(sourceNode, targetNode))
                .attr('stroke', link.isException ? '#dc2626' : STAGE_COLORS[sourceNode.stage])
                .attr('stroke-width', Math.max(1, link.volume / 5))
                .on('mouseover', (event) => this.handleLinkHover(event, link, sourceNode, targetNode))
                .on('mouseout', () => this.handleLinkOut());
        });
    }

    /**
     * Render all nodes
     */
    renderNodes() {
        NODES.forEach(node => {
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
            .attr('class', `node ${node.deadline === 'strict' ? 'deadline-strict' : ''}`)
            .attr('data-node-id', node.id)
            .attr('transform', `translate(${node.x}, ${node.y})`)
            .attr('aria-label', `${node.name.replace(/\n/g, ' ')} - ${node.rule || 'No rule'}`);

        // Calculate height based on text lines
        const lines = node.name.split('\n');
        const rectHeight = lines.length > 1 ?
            CONFIG.node.multiLineHeight :
            CONFIG.node.singleLineHeight;

        // Main rectangle
        nodeGroup.append('rect')
            .attr('x', 0)
            .attr('y', -rectHeight / 2)
            .attr('width', CONFIG.node.width)
            .attr('height', rectHeight)
            .attr('fill', STAGE_COLORS[node.stage])
            .attr('rx', CONFIG.node.borderRadius)
            .on('mouseover', (event) => this.handleNodeHover(event, node))
            .on('mouseout', () => this.handleNodeOut())
            .on('click', () => this.handleNodeClick(node));

        // Node text (name)
        lines.forEach((line, i) => {
            nodeGroup.append('text')
                .attr('x', 24)
                .attr('y', lines.length > 1 ? -12 + i * 12 : -4)
                .attr('dy', '0.35em')
                .style('font-size', '10px')
                .text(line);
        });

        // Rule reference
        if (node.rule) {
            nodeGroup.append('text')
                .attr('x', 24)
                .attr('y', lines.length > 1 ? 6 : 6)
                .style('font-size', '8px')
                .style('fill', '#64748b')
                .text(node.rule);
        }

        // Duration
        if (node.duration && node.duration !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', 24)
                .attr('y', lines.length > 1 ? 16 : 16)
                .style('font-size', '8px')
                .style('fill', '#7c3aed')
                .text(`⏱ ${node.duration}`);
        }

        // Cost
        if (node.cost && node.cost !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', 24)
                .attr('y', lines.length > 1 ? 26 : 26)
                .style('font-size', '8px')
                .style('fill', '#059669')
                .text(`💰 ${node.cost}`);
        }

        // Owner
        if (node.owner && node.owner !== 'n/a') {
            nodeGroup.append('text')
                .attr('x', 24)
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
        this.highlightNodeAndPaths(node.id);
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
        const node = NODES.find(n => n.id === nodeId);
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
        }
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

/**
 * Utility Functions
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate Bezier curve path for links
 * @param {Object} source - Source node
 * @param {Object} target - Target node
 * @returns {string} SVG path string
 */
export function generateCurvePath(source, target) {
    const x0 = source.x + 20;
    const y0 = source.y;
    const x1 = target.x;
    const y1 = target.y;
    const xi = (x0 + x1) / 2;
    return `M${x0},${y0} C${xi},${y0} ${xi},${y1} ${x1},${y1}`;
}

/**
 * Clean node name by removing newlines
 * @param {string} name - Node name with potential newlines
 * @returns {string} Cleaned name
 */
export function cleanNodeName(name) {
    return name.replace(/\n/g, ' ');
}

/**
 * Format tooltip HTML
 * @param {Object} node - Node data
 * @returns {string} HTML string for tooltip
 */
export function formatTooltip(node) {
    let html = `<strong>${cleanNodeName(node.name)}</strong>`;

    if (node.rule) {
        html += `<div class="section"><div class="label">Florida Rule</div>${node.rule}</div>`;
    }

    if (node.duration && node.duration !== "n/a") {
        html += `<div class="section"><div class="label">Timeline</div>${node.duration}</div>`;
    }

    if (node.cost && node.cost !== "n/a") {
        html += `<div class="section"><div class="label">Estimated Cost</div>${node.cost}</div>`;
    }

    if (node.owner && node.owner !== "n/a") {
        html += `<div class="section"><div class="label">Responsible Party</div>${node.owner}</div>`;
    }

    if (node.trigger) {
        html += `<div class="section"><div class="label">Trigger Event</div>${node.trigger}</div>`;
    }

    if (node.documents && node.documents.length > 0) {
        const docList = node.documents.slice(0, 5).join(', ');
        const more = node.documents.length > 5 ? ` (+${node.documents.length - 5} more)` : '';
        html += `<div class="section"><div class="label">Required Documents</div>${docList}${more}</div>`;
    }

    if (node.deadline) {
        const deadlineText = {
            'strict': 'Statutory Deadline (Strict)',
            'flexible': 'Flexible Timeline',
            'court-set': 'Court-Determined Deadline'
        }[node.deadline] || node.deadline;
        html += `<div class="section"><div class="label">Deadline Type</div>${deadlineText}</div>`;
    }

    if (node.notes) {
        html += `<div class="section notes"><div class="label">Practice Note</div>${node.notes}</div>`;
    }

    if (node.isExpandable) {
        html += `<div class="section expandable-hint">Click to expand/collapse sub-steps</div>`;
    }

    return html;
}

/**
 * Format link tooltip HTML
 * @param {Object} link - Link data
 * @param {Object} sourceNode - Source node
 * @param {Object} targetNode - Target node
 * @returns {string} HTML string for tooltip
 */
export function formatLinkTooltip(link, sourceNode, targetNode) {
    return `<strong>${cleanNodeName(sourceNode.name)} → ${cleanNodeName(targetNode.name)}</strong>
            <div class="section">
                <div class="label">Path</div>${link.label}
            </div>
            <div class="section">
                <div class="label">Trigger</div>${link.trigger}
            </div>
            <div class="section">
                <div class="label">Volume</div>${link.volume}% of cases
            </div>`;
}

/**
 * Export SVG to PNG
 * @param {SVGElement} svgElement - The SVG element to export
 * @param {string} filename - Output filename
 */
export function exportToPNG(svgElement, filename = 'florida-civil-procedure.png') {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        canvas.width = svgElement.width.baseVal.value * 2; // Higher resolution
        canvas.height = svgElement.height.baseVal.value * 2;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function(blob) {
            const a = document.createElement('a');
            a.download = filename;
            a.href = URL.createObjectURL(blob);
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    img.src = url;
}

/**
 * Export SVG
 * @param {SVGElement} svgElement - The SVG element to export
 * @param {string} filename - Output filename
 */
export function exportToSVG(svgElement, filename = 'florida-civil-procedure.svg') {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Search nodes by name, rule, or stage
 * @param {Array} nodes - Array of nodes
 * @param {string} query - Search query
 * @returns {Array} Matching nodes
 */
export function searchNodes(nodes, query) {
    if (!query || query.trim() === '') return [];

    const lowerQuery = query.toLowerCase().trim();

    return nodes.filter(node => {
        return (
            cleanNodeName(node.name).toLowerCase().includes(lowerQuery) ||
            (node.rule && node.rule.toLowerCase().includes(lowerQuery)) ||
            (node.stage && node.stage.toLowerCase().includes(lowerQuery)) ||
            (node.owner && node.owner.toLowerCase().includes(lowerQuery)) ||
            (node.documents && node.documents.some(doc =>
                doc.toLowerCase().includes(lowerQuery)
            ))
        );
    });
}

/**
 * Highlight a specific node
 * @param {number} nodeId - ID of node to highlight
 */
export function highlightNode(nodeId) {
    // Remove existing highlights
    document.querySelectorAll('.node-highlight').forEach(el => {
        el.classList.remove('node-highlight');
    });

    // Add highlight to target node
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeElement) {
        nodeElement.classList.add('node-highlight');
        nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Get all paths from one node to another
 * @param {Array} links - Array of links
 * @param {number} startId - Starting node ID
 * @param {number} endId - Ending node ID
 * @returns {Array} Array of paths
 */
export function findPaths(links, startId, endId, visited = new Set()) {
    if (startId === endId) return [[endId]];
    if (visited.has(startId)) return [];

    visited.add(startId);
    const paths = [];

    const outgoingLinks = links.filter(link => link.source === startId);

    for (const link of outgoingLinks) {
        const subPaths = findPaths(links, link.target, endId, new Set(visited));
        for (const subPath of subPaths) {
            paths.push([startId, ...subPath]);
        }
    }

    return paths;
}

/**
 * Calculate statistics from the workflow
 * @param {Array} nodes - Array of nodes
 * @param {Array} links - Array of links
 * @returns {Object} Statistics object
 */
export function calculateStatistics(nodes, links) {
    const totalNodes = nodes.length;
    const decisionPoints = nodes.filter(n => n.isDecision).length;
    const exceptionPaths = nodes.filter(n => n.isException).length;
    const stages = [...new Set(nodes.map(n => n.stage))].length;

    const totalVolume = nodes.reduce((sum, node) => sum + (node.volume || 0), 0);
    const avgVolume = totalVolume / totalNodes;

    const strictDeadlines = nodes.filter(n => n.deadline === 'strict').length;

    return {
        totalNodes,
        decisionPoints,
        exceptionPaths,
        stages,
        avgVolume: avgVolume.toFixed(1),
        strictDeadlines,
        totalLinks: links.length
    };
}

/**
 * Keyboard shortcuts handler
 * @param {Object} handlers - Object mapping keys to handler functions
 */
export function setupKeyboardShortcuts(handlers) {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;

        if (handlers[key] && !ctrl) {
            e.preventDefault();
            handlers[key]();
        } else if (ctrl && handlers[`ctrl+${key}`]) {
            e.preventDefault();
            handlers[`ctrl+${key}`]();
        }
    });
}

/**
 * Create keyboard shortcuts legend
 * @returns {string} HTML string for shortcuts
 */
export function getShortcutsHTML() {
    return `
        <div class="shortcuts">
            <strong>Keyboard Shortcuts:</strong>
            <div class="shortcut-list">
                <span><kbd>R</kbd> Reset View</span>
                <span><kbd>+</kbd> Zoom In</span>
                <span><kbd>-</kbd> Zoom Out</span>
                <span><kbd>/</kbd> Search</span>
                <span><kbd>D</kbd> Toggle Documents</span>
                <span><kbd>E</kbd> Toggle Exceptions</span>
                <span><kbd>?</kbd> Show Help</span>
            </div>
        </div>
    `;
}

/**
 * Calculate cost estimates from selected nodes
 * @param {Array} nodes - Array of selected node objects
 * @param {number} hourlyRate - Attorney hourly rate (0 if not enabled)
 * @returns {Object} Cost estimates with min/max values
 */
export function calculateCostEstimates(nodes, hourlyRate = 0) {
    let hoursMin = 0;
    let hoursMax = 0;
    let fixedCostsMin = 0;
    let fixedCostsMax = 0;
    let daysMin = 0;
    let daysMax = 0;

    nodes.forEach(node => {
        // Attorney hours
        hoursMin += node.attorneyHoursMin || 0;
        hoursMax += node.attorneyHoursMax || 0;

        // Fixed costs (filing fees, service fees, etc.)
        if (node.fixedCosts && Array.isArray(node.fixedCosts)) {
            node.fixedCosts.forEach(cost => {
                fixedCostsMin += cost.amountMin || cost.amount || 0;
                fixedCostsMax += cost.amountMax || cost.amount || 0;
            });
        }

        // Duration in days
        daysMin += node.durationDaysMin || 0;
        daysMax += node.durationDaysMax || 0;
    });

    // Calculate attorney fees based on hourly rate
    const attorneyFeesMin = hoursMin * hourlyRate;
    const attorneyFeesMax = hoursMax * hourlyRate;

    // Calculate grand totals
    const totalMin = fixedCostsMin + attorneyFeesMin;
    const totalMax = fixedCostsMax + attorneyFeesMax;

    return {
        hoursMin,
        hoursMax,
        fixedCostsMin,
        fixedCostsMax,
        daysMin,
        daysMax,
        attorneyFeesMin,
        attorneyFeesMax,
        totalMin,
        totalMax
    };
}

/**
 * Format currency value or range for display
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value (optional, defaults to min)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(min, max = min) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    if (min === max || max === undefined) {
        return formatter.format(min);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
}

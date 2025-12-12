# Visualization Communication Guide

A vocabulary reference for discussing and modifying the Florida Civil Procedure workflow visualization.

## Elements

| Term | What it means | Examples |
|------|---------------|----------|
| **Node** or **Step** | A box representing a litigation step | "Complaint Filed", "Discovery Begins" |
| **Link** or **Connection** | An arrow connecting two nodes | The arrow from "Complaint Filed" to "Service Required" |
| **Branch** | A path of connected nodes | "The discovery branch" |
| **Group** | An expandable/collapsible set of nodes | "The trial group" (nodes hidden behind Trial Begins +) |
| **Terminal node** | A node with no outgoing connections | Sanctions, Proposal for Settlement |
| **Parent node** | The expandable node that reveals a group | "Discovery Begins" is parent to the discovery group |
| **Child nodes** | Nodes revealed when a parent is expanded | Interrogatories, Depositions, etc. |

## Spatial Language

| Direction | Meaning in this chart |
|-----------|----------------------|
| **Left** | Earlier in the litigation process |
| **Right** | Later in the litigation process |
| **Up / Above** | Higher on the screen (lower y value) |
| **Down / Below** | Lower on the screen (higher y value) |
| **Upstream** | Nodes that come before (to the left) |
| **Downstream** | Nodes that come after (to the right) |

## Describing Connections

- **"Node A connects to Node B"** - There's an arrow from A to B
- **"Node A stems from Node B"** - B connects to A (A is downstream of B)
- **"Node A feeds into Node B"** - A connects to B
- **"Node A branches off from Node B"** - A is one of several nodes that B connects to
- **"Make Node A terminal"** - Remove all outgoing connections from A

## Describing Position

Instead of coordinates, you can say:
- **"Position it below Complaint Filed"**
- **"Move it to the left, near the start of the flow"**
- **"Place it between Discovery and Trial"**
- **"Align it vertically with the Service nodes"**

## Describing Groups

- **"Add Node X to the discovery group"** - X will show/hide with discovery nodes
- **"Make Node X expandable"** - X gets a + button that reveals child nodes
- **"Collapse by default"** - Group starts hidden until user clicks +

## Example Requests

Here are some well-phrased requests:

> "Move the Mediation node so it stems from Case Management Conference and is terminal"

> "Create a new branch below Complaint Filed with three steps: A → B → C, all terminal"

> "Add Motion for Sanctions to the discovery group, positioned below Motion to Compel"

> "The Appeal branch should connect downstream to the Final Judgment node"

## Technical Reference

For developers, here's how these concepts map to the codebase:

| Concept | Code Location | Data Structure |
|---------|---------------|----------------|
| Nodes | `js/data.js` → `NODES` | `{ id, name, x, y, stage, ... }` |
| Links | `js/data.js` → `LINKS` | `{ source, target, volume, label }` |
| Groups | `js/data.js` → `NODE_GROUPS` | `{ parentNodeId, childNodeIds, expanded }` |
| Stages (colors) | `js/data.js` → `STAGE_COLORS` | `{ StageName: "#hexcolor" }` |

### Node Properties

```javascript
{
    id: 0,                    // Unique identifier
    name: "Node Name",        // Display text (\n for line break)
    x: 100,                   // Horizontal position (left to right)
    y: 600,                   // Vertical position (top to bottom)
    stage: "Filing",          // Color category
    isDecision: true,         // Diamond shape (decision point)
    isException: true,        // Red dashed styling
    isExpandable: true,       // Has + button to expand group
    expandsGroup: "groupName",// Which group it expands
    group: "groupName",       // Which group it belongs to (as child)
}
```

### Link Properties

```javascript
{
    source: 0,               // ID of origin node
    target: 1,               // ID of destination node
    volume: 100,             // Line thickness (percentage)
    label: "Connection",     // Text on the arrow
    isException: true,       // Red dashed line
}
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive D3.js visualization of the Florida Civil Procedure workflow from complaint filing through appeal. It's a static web application with no build process or server-side dependencies—all files run directly in the browser using ES6 modules.

The visualization includes 45+ process steps with timing data, cost estimates, decision points, exception paths, and required documents for each stage of civil litigation in Florida.

## Development Commands

### Running Locally
```bash
# No build required - open index.html directly in browser
open index.html

# Or serve with live reload
npm start              # Uses npx serve
npm run dev            # Serves on port 8000
python -m http.server 8000  # Alternative with Python
```

### Deployment

**Recommended: AWS CDK (Infrastructure as Code)**
```bash
cd infrastructure
npm install          # First time only
npm run deploy       # Deploy everything (infrastructure + files)
```

**Alternative: Manual Deployment Scripts**
```bash
# Deploy to AWS S3 (requires AWS CLI configured)
./deploy.sh your-bucket-name us-east-1

# Deploy to subdomain
./deploy-subdomain.sh your-bucket-name us-east-1 florida-civil-procedure.yourdomain.com
```

### Testing & Quality
```bash
npm run lint          # Currently not configured
npm test              # Currently not configured
```

## Architecture

### Module Structure

The application follows a clean separation of concerns with ES6 modules:

- **`js/app.js`** - Application entry point and initialization coordinator
  - Instantiates and wires together ChartRenderer and ControlsManager
  - Handles global error states and accessibility announcements
  - Exposes `window.floridaCivilProcedureApp` for debugging

- **`js/chart.js`** - ChartRenderer class manages D3.js visualization
  - Renders nodes, links, and visual layers (documents, decisions, exceptions)
  - Implements zoom/pan behavior using d3.zoom
  - Maintains layer groups for organized rendering and toggling
  - Handles node highlighting and tooltip display

- **`js/controls.js`** - ControlsManager handles all user interactions
  - Search functionality with real-time filtering
  - Export to PNG/SVG
  - Zoom controls and filter toggles
  - Keyboard shortcuts
  - Statistics display

- **`js/data.js`** - Complete workflow data configuration
  - `NODES` array: 45+ steps with metadata (rule, stage, volume, duration, cost, documents, owner, etc.)
  - `LINKS` array: Connections between steps with volume/thickness data
  - `STAGE_COLORS`: Color coding for process stages
  - `CONFIG`: Chart dimensions and zoom settings

- **`js/utils.js`** - Shared utility functions
  - Curved path generation for links
  - Tooltip formatting
  - Search/filter algorithms
  - Export functions (PNG/SVG)
  - Keyboard shortcut setup
  - Statistics calculation

### Key Design Patterns

**No Build Process**: Files are designed to work directly in browsers. D3.js loads from CDN. ES6 modules are supported natively by modern browsers.

**Layer-Based Rendering**: The chart uses separate SVG groups for different visual elements (links, exceptions, nodes, documents, decisions), enabling independent toggling and organized z-index management.

**Data-Driven Visualization**: All workflow steps, connections, and metadata live in `js/data.js` as structured JSON. The rendering logic is completely separate from the data model.

**State Management**: ChartRenderer maintains visibility state (`documents`, `decisions`, `exceptions`) and highlight state. ControlsManager maintains search results state. No external state library is used.

## Data Model

Each node in the workflow has this structure:
```javascript
{
    id: 0,                          // Unique identifier
    name: "Complaint\nFiled",       // Display name (\n for multiline)
    rule: "1.100",                  // Florida Rules of Civil Procedure reference
    x: 100, y: 700,                 // SVG coordinates for positioning
    stage: "Filing",                // Process stage (maps to STAGE_COLORS)
    volume: 100,                    // Percentage of cases reaching this step
    duration: "Day 1",              // Time estimate
    cost: "2-5h+$400",             // Cost estimate (hours + filing fees)
    documents: ["Complaint"],       // Required document list
    owner: "Attorney",              // Responsible party
    trigger: "File",                // What initiates this step
    deadline: "strict",             // strict|flexible - affects visual styling
    isDecision: false,              // True for decision diamond nodes
    isException: false              // True for error/exception paths
}
```

Links define connections:
```javascript
{
    source: 0,           // Source node ID
    target: 1,           // Target node ID
    volume: 100,         // Percentage (affects line thickness)
    label: "Service",    // Optional label
    isException: false   // Exception paths are styled differently
}
```

## Working with the Visualization

### Adding New Steps
1. Add a node object to the `NODES` array in `js/data.js`
2. Assign unique `id` and position (`x`, `y` coordinates)
3. Set appropriate `stage` (must match a key in `STAGE_COLORS`)
4. Add links in the `LINKS` array connecting the new node

### Modifying Layout
- Node positions are manual (`x`, `y` in data.js) - no automatic layout
- The chart viewBox is 2800x1800 (see `CONFIG.chart` in data.js)
- Use consistent spacing: typically 150-200px between major steps

### Styling Changes
- All CSS is in `css/styles.css`
- CSS variables in `:root` define the theme colors
- Dark mode uses `@media (prefers-color-scheme: dark)`
- SVG styling is split between CSS classes and D3.js inline styles

### Testing Locally
Open `index.html` directly in a browser - no server required for basic functionality. Use a local server (Python or npx serve) to avoid CORS issues with ES6 module imports in some browsers.

## Dependencies

**External CDN Dependencies:**
- D3.js v7.8.5 (loaded from cdnjs.cloudflare.com in index.html)

**No npm dependencies** - The package.json exists for metadata but the app has zero runtime dependencies.

## Browser Compatibility

Requires modern browser with:
- ES6 module support (`import`/`export`)
- SVG rendering
- CSS Grid and Flexbox
- D3.js v7 compatibility

Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Recent Improvements

### Latest Changes (December 2025)
- **MIME Type Fix**: Automatic correction of JavaScript/CSS MIME types during CDK deployment
- **Deployment Infrastructure**: Complete AWS CDK implementation for automated deployment
- **Enhanced Workflow**: Added comprehensive commercial litigation workflow tracks
- **Trial Phase Detail**: Expanded visualization with detailed trial phase and decision branches
- **Custom Domain**: Fully integrated `law.jamescmooney.com` with SSL/TLS certificate

See git commit history for complete change log.

## Deployment Notes

This application is **static-only** and optimized for AWS S3 + CloudFront:
- No backend, no API, no database
- All assets are frontend files (HTML, CSS, JS)
- Currently deployed to: **`https://law.jamescmooney.com`**

### Deployment Options

1. **AWS CDK (Recommended)** - `infrastructure/` directory
   - Complete infrastructure as code in TypeScript
   - Automated deployment with `npm run deploy`
   - Creates S3 bucket, CloudFront distribution, ACM certificate, and Route 53 record
   - Automatic file sync and CloudFront invalidation
   - Automatic MIME type correction for JS/CSS files
   - See `infrastructure/README.md` for full setup instructions

2. **Manual Scripts** - `deploy.sh` and `deploy-subdomain.sh`
   - Legacy bash scripts for manual deployment
   - See `DEPLOYMENT.md` for AWS Console setup instructions
   - See `CUSTOM-DOMAIN.md` for custom domain configuration
   - **Note**: Manual deployments may require MIME type fixes

**Important**: The app requires ES6 module support. S3 must serve `.js` files with correct MIME type (`application/javascript`). The CDK deployment handles this automatically.

## Troubleshooting

### JavaScript/CSS Files Not Loading (MIME Type Errors)

**Issue**: Browser console shows errors like `'text/html' is not a valid JavaScript MIME type`

**Root Cause**: S3 BucketDeployment doesn't always set correct content types for JS/CSS files

**Solution**: The CDK deployment includes automatic MIME type correction. If issues persist:
```bash
cd infrastructure
npm run fix-mime-types
```

### CloudFront Shows Old Content

**Issue**: Website shows cached content after deployment

**Solution**: CDK automatically invalidates cache during deployment. Manual invalidation:
```bash
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## File Structure

```
florida-civil-procedure/
├── index.html              # Main application entry point
├── css/
│   └── styles.css         # All application styles (light/dark theme)
├── js/
│   ├── app.js            # Application initialization
│   ├── chart.js          # D3.js visualization renderer
│   ├── controls.js       # User interaction handling
│   ├── data.js           # Workflow data and configuration
│   └── utils.js          # Shared utilities
├── infrastructure/        # AWS CDK deployment (TypeScript)
│   ├── bin/              # CDK app entry point
│   ├── lib/              # CDK stack definitions
│   ├── scripts/          # Helper scripts (MIME type fixes)
│   └── README.md         # Detailed CDK documentation
├── deploy.sh             # Legacy manual deployment script
├── deploy-subdomain.sh   # Legacy subdomain deployment script
├── CLAUDE.md             # This file (AI assistant instructions)
├── README.md             # User-facing documentation
├── DEPLOYMENT.md         # Manual AWS setup guide
└── CUSTOM-DOMAIN.md      # Domain configuration guide
```

## Legal Disclaimer

This visualization is based on Florida Rules of Civil Procedure and is for educational/planning purposes only. Data reflects rules as of December 2025. Always verify against current official rules and consult legal professionals for actual cases.

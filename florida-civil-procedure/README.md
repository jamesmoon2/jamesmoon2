# Florida Civil Procedure - Interactive Workflow Visualization

An interactive, web-based visualization of the complete Florida Civil Procedure workflow, from complaint filing through appeal. This tool provides a comprehensive software specification including timing, costs, required documents, decision logic, and exception handling for civil litigation in Florida.

## 🌟 Features

### Interactive Visualization
- **Pan & Zoom**: Click and drag to pan, use mouse wheel or buttons to zoom
- **Node Highlighting**: Click any step to highlight and focus on it
- **Tooltips**: Hover over any element to see detailed information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Advanced Search
- **Real-time Search**: Find steps by name, rule number, stage, or responsible party
- **Keyboard Shortcut**: Press `/` to quickly focus the search box
- **Smart Results**: Click any result to highlight and navigate to that step

### Data Visualization
- **45+ Process Steps**: Complete workflow from filing to appeal
- **Decision Points**: Visual indicators for strategic decision points
- **Exception Paths**: Separate highlighting for error/exception paths (default, dismissal, sanctions)
- **Timeline & Cost Data**: Each step shows estimated duration and cost
- **Document Tracking**: See required documents for each step

### Export Capabilities
- **PNG Export**: Export high-resolution PNG images
- **SVG Export**: Export scalable vector graphics
- **Print-Friendly**: Optimized CSS for printing

### Accessibility
- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard control
- **High Contrast**: Meets WCAG contrast requirements
- **Semantic HTML**: Proper document structure

### Modern Architecture
- **Modular ES6**: Separate modules for data, rendering, controls, and utilities
- **Clean Code**: Well-documented, maintainable codebase
- **Performance**: Optimized D3.js rendering
- **Error Handling**: Graceful error handling and user feedback

## 📁 Project Structure

```
florida-civil-procedure/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Complete stylesheet with theming
├── js/
│   ├── app.js              # Application entry point
│   ├── chart.js            # D3.js chart rendering logic
│   ├── controls.js         # UI controls and interactions
│   ├── data.js             # Workflow data configuration
│   └── utils.js            # Utility functions
├── assets/                 # (Future: images, icons)
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required - runs directly in browser!

### Local Installation

1. **Clone or download** this repository
2. **Open** `index.html` in your web browser
3. **That's it!** No server or build process needed

For development with live reload:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

### ☁️ Cloud Deployment (AWS)

This application is **deployed using AWS CDK** for automated infrastructure management.

**Recommended: AWS CDK Deployment**
```bash
cd infrastructure
npm install          # First time only
npm run deploy       # Deploy everything (infrastructure + files)
```

The CDK deployment automatically:
- Creates and configures S3 bucket
- Sets up CloudFront distribution with SSL/TLS
- Manages custom domain and Route 53 records
- Handles MIME types correctly for ES6 modules
- Invalidates CloudFront cache on updates

See `infrastructure/README.md` for detailed setup instructions.

**Legacy Manual Deployment** (archived)
Legacy deployment scripts and guides are available in `docs/archive/`:
- `docs/archive/deploy.sh` - Basic S3 deployment script
- `docs/archive/DEPLOYMENT.md` - Manual AWS Console setup guide
- `docs/archive/CUSTOM-DOMAIN.md` - Custom domain configuration

Note: Manual deployments may require additional MIME type configuration.

## 🎮 Usage

### Navigation
- **Pan**: Click and drag on the canvas
- **Zoom**: Use mouse wheel, or click zoom buttons
- **Reset**: Click "Reset View" or press `R`

### Search
1. Type in the search box (or press `/`)
2. Results appear as you type
3. Click any result to navigate to that step

### Filtering
- **Toggle Documents**: Show/hide document icons
- **Toggle Decisions**: Show/hide decision diamonds
- **Toggle Exceptions**: Show/hide exception paths

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `R` | Reset view to default |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `/` | Focus search box |
| `D` | Toggle document icons |
| `E` | Toggle exception paths |
| `ESC` | Clear highlights & close search |
| `?` | Show help |

### Understanding the Visualization

#### Node Types
- **Rectangle**: Standard process step
- **Red Border**: Strict statutory deadline
- **Yellow Diamond**: Decision point

#### Information Displayed
- **👤 Owner**: Responsible party (Attorney, Paralegal, Court, etc.)
- **⏱️ Duration**: Time required for this step
- **💰 Cost**: Estimated cost in hours or dollars
- **📄 Documents**: Required documents (click icon for list)
- **Rule Number**: Florida Rules of Civil Procedure reference

#### Link Types
- **Solid Line**: Normal process flow
- **Dashed Red Line**: Exception/error path
- **Line Thickness**: Represents volume/frequency

## 📊 Data Structure

### Node Properties
```javascript
{
    id: 0,                          // Unique identifier
    name: "Complaint\nFiled",       // Display name
    rule: "1.100",                  // FL Rules of Civil Procedure
    x: 100, y: 700,                 // Position coordinates
    stage: "Filing",                // Process stage
    volume: 100,                    // Percentage of cases
    duration: "Day 1",              // Timeline
    cost: "2-5h+$400",             // Cost estimate
    documents: ["Complaint"],       // Required documents
    owner: "Attorney",              // Responsible party
    trigger: "File",                // Triggering event
    deadline: "strict",             // Deadline type
    isDecision: false,              // Decision point?
    isException: false              // Exception path?
}
```

### Customization

To customize the data:
1. Open `js/data.js`
2. Modify `NODES` array to add/edit steps
3. Modify `LINKS` array to change connections
4. Update `STAGE_COLORS` for color customization

## 🎨 Theming

The visualization supports light and dark modes (respects system preference).

Custom theme variables in `css/styles.css`:
```css
:root {
    --primary-blue: #3b82f6;
    --text-primary: #1a2332;
    --bg-primary: #ffffff;
    /* ... and more */
}
```

## 🧪 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires:
- ES6 Modules support
- SVG rendering
- CSS Grid & Flexbox

## 📝 Florida Rules Reference

This visualization is based on:
- Florida Rules of Civil Procedure (Rules 1.xxx)
- Florida Appellate Rules (Rules 9.xxx)
- Florida Statutes Chapter 77 (Execution)
- Florida Statutes 768.79 (Offer of Judgment)

**Disclaimer**: This tool is for educational and planning purposes only. Always consult the official Florida Rules of Civil Procedure and seek professional legal advice.

## 🔧 Development

### Code Quality
- **Modular Design**: Separation of concerns
- **ES6 Modules**: Modern JavaScript
- **Commented Code**: Extensive documentation
- **Error Handling**: Try-catch blocks and validation

### Future Enhancements
- [ ] Interactive timeline view
- [ ] Cost calculator
- [ ] Document checklist generator
- [ ] Path comparison tool
- [ ] Mobile app version
- [ ] Integration with case management systems
- [ ] Multi-language support
- [ ] Customizable workflows

### Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided as-is for educational purposes. No warranty is provided.
Legal data is based on publicly available Florida court rules and statutes.

## 🙏 Acknowledgments

- **D3.js**: Data visualization library
- **Florida Courts**: For maintaining comprehensive civil procedure rules
- **Legal Community**: For feedback and requirements

## 📞 Support

For issues, questions, or suggestions:
- Open an issue in the repository
- Check existing documentation
- Review the Florida Rules of Civil Procedure

## 📚 Additional Resources

- [Florida Rules of Civil Procedure](https://www.flrules.org/gateway/Division.asp?DivID=7)
- [Florida Courts](https://www.flcourts.gov/)
- [D3.js Documentation](https://d3js.org/)

---

**Last Updated**: November 2025
**Version**: 2.0.0
**Status**: Production Ready

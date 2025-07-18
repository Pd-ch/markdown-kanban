# Change Log

All notable changes to the "Markdown Kanban" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2025-07-18

### Added

- 🎉 Initial release of Markdown Kanban
- 📝 Transform markdown files into interactive Kanban boards
- 🖱️ Drag and drop functionality to move tasks between columns
- ✅ Click-to-toggle checkboxes for task completion
- 🌳 Support for nested tasks with indentation
- 🔄 Real-time synchronization between markdown and board views
- 🎨 Automatic theme adaptation (light/dark/high-contrast)
- 🚀 Three main commands:
  - Open as Kanban Board
  - Open as Markdown
  - Create New Board
- 📚 Comprehensive documentation and examples
- 🔧 Zero-configuration setup - works out of the box

### Features

- **Markdown Native**: Uses standard markdown syntax with no proprietary formats
- **Visual Organization**: Transform text lists into visual columns
- **Seamless Integration**: Full VS Code theme and workspace integration
- **Flexible Structure**: Support for any markdown heading structure
- **Preserved Formatting**: Maintains all markdown features (links, bold, italic, etc.)

### Technical

- Custom Text Editor implementation for seamless file handling
- Webview-based board interface with modern UI
- Efficient state management with live document synchronization
- Webpack-optimized build for fast loading
- TypeScript throughout for reliability and maintainability

### Compatibility

- ✅ VS Code 1.60.0 and above
- ✅ All VS Code themes
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Standard markdown files (.md, .markdown)

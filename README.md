# Markdown Kanban

Transform your markdown files into beautiful, interactive Kanban boards right inside VS Code. View, organize, and track your tasks with a visual board while keeping all the power and simplicity of markdown.

## ✨ Features

- **📝 Markdown Native**: Uses standard markdown syntax - no proprietary formats
- **👀 Visual Board**: Transform markdown into interactive Kanban boards
- **🖱️ Drag & Drop**: Move tasks between columns with simple drag and drop
- **✅ Quick Actions**: Toggle task completion with checkboxes
- **🌳 Nested Tasks**: Support for hierarchical task structures with indentation
- **🔄 Live Sync**: Changes in markdown automatically reflect in the board view
- **🎨 VS Code Integration**: Follows your VS Code theme and integrations

## 🚀 Quick Start

### 1. Create a Markdown Kanban Board

Create a markdown file with this structure:

```markdown
## Todo

- [ ] Task one
- [ ] Task two
  - [ ] Subtask 2.1
  - [ ] Subtask 2.2

## In Progress

- [ ] Working on this task

## Done

- [x] Completed task
- [x] Another finished task
```

### 2. Open as Kanban Board

- Right-click on any `.md` file
- Select **"Open with..."**
- Choose **"Kanban Board"**

Or use the command palette:

- Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- Type "Kanban: Open as Kanban Board"

## 📖 Usage

### Viewing Mode

The Kanban board provides a visual overview of your tasks organized in columns (based on your markdown headings).

### Editing Tasks

- **Edit text**: Switch to markdown view to edit task titles, add new tasks, or modify structure
- **Toggle completion**: Click checkboxes directly in the board view
- **Move tasks**: Drag and drop tasks between columns
- **Add columns**: Add new `## Column Name` headers in markdown
- **Nested tasks**: Use indentation in markdown to create subtasks

### Switching Views

- **Board → Markdown**: Click "View as Markdown" button in the board
- **Markdown → Board**: Right-click file → "Open with" → "Kanban Board"

## 🎯 Best Practices

### Markdown Structure

```markdown
---
title: My Project Board
---

## Backlog

- [ ] Feature A
- [ ] Feature B
  - [ ] Subtask B.1
  - [ ] Subtask B.2

## In Progress

- [ ] Current work item

## Review

- [ ] Items under review

## Done

- [x] Completed features
```

### Organization Tips

- Use consistent heading levels (`##`) for columns
- Leverage markdown features: links, **bold**, _italic_, etc.
- Add frontmatter for metadata
- Use indentation for task hierarchies

## ⚙️ Configuration

The extension works out of the box with no configuration needed. It automatically:

- Detects markdown headings as Kanban columns
- Treats list items with checkboxes as tasks
- Preserves all markdown formatting and structure

## 🔧 Commands

| Command                                 | Description                                     |
| --------------------------------------- | ----------------------------------------------- |
| `Markdown Kanban: Open as Kanban Board` | Open current markdown file as Kanban board      |
| `Markdown Kanban: Open as Markdown`     | Switch from board view back to markdown         |
| `Markdown Kanban: Create New Board`     | Create a new markdown file with Kanban template |

## 🎨 Themes

The extension automatically adapts to your VS Code theme, supporting:

- Light themes
- Dark themes
- High contrast themes
- Custom color schemes

## 📝 Examples

### Simple Project Board

```markdown
## Todo

- [ ] Setup project
- [ ] Write documentation
- [ ] Create tests

## Doing

- [ ] Implement core features

## Done

- [x] Initial research
```

### Complex Project with Nested Tasks

```markdown
## Planning

- [ ] Project kickoff
  - [ ] Stakeholder meeting
  - [ ] Requirements gathering
  - [ ] Technical planning

## Development

- [ ] Backend API
  - [ ] User authentication
  - [ ] Data models
  - [ ] API endpoints
- [ ] Frontend UI
  - [ ] Component library
  - [ ] Main interface
  - [ ] Mobile responsive

## Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] User acceptance testing

## Deployment

- [x] Development environment
- [ ] Staging environment
- [ ] Production deployment
```

## 🤝 Contributing

Found a bug or have a feature request? Please [open an issue](https://github.com/Pd-ch/markdown-kanban/issues).

## 📄 License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy organizing your tasks with Markdown Kanban! 🎉**

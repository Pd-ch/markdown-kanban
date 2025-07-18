import * as vscode from 'vscode';
import { KanbanEditorProvider } from './editors/kanbanEditor';
import { parseMarkdownToBoard, boardToMarkdown } from './parsers/markdown';
import { basicFrontmatter, frontmatterKey } from './types';

export function activate(context: vscode.ExtensionContext) {
    console.log('Kanban extension is now active!');

    // Register custom editor provider
    context.subscriptions.push(KanbanEditorProvider.register(context));

    // Register commands
    const createBoardCommand = vscode.commands.registerCommand('kanban.createBoard', async (uri?: vscode.Uri) => {
        const folderUri = uri || vscode.workspace.workspaceFolders?.[0]?.uri;
        if (!folderUri) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter Kanban board name',
            value: 'Kanban Board'
        });

        if (!fileName) {
            return;
        }

        const fileUri = vscode.Uri.joinPath(folderUri, `${fileName}.md`);

        try {
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(basicFrontmatter));
            const document = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(document);

            // Open as kanban board
            vscode.commands.executeCommand('vscode.openWith', fileUri, 'kanban.board');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create Kanban board: ${error}`);
        }
    });

    const openAsKanbanCommand = vscode.commands.registerCommand('kanban.openAsKanban', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document.fileName.endsWith('.md')) {
            vscode.window.showErrorMessage('Please open a Markdown file first');
            return;
        }

        vscode.commands.executeCommand('vscode.openWith', activeEditor.document.uri, 'kanban.board');
    });

    const openAsMarkdownCommand = vscode.commands.registerCommand('kanban.openAsMarkdown', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        vscode.commands.executeCommand('vscode.openWith', activeEditor.document.uri, 'default');
    });

    const archiveCompletedCommand = vscode.commands.registerCommand('kanban.archiveCompleted', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document.fileName.endsWith('.md')) {
            vscode.window.showErrorMessage('Please open a Kanban board first');
            return;
        }

        try {
            const board = await parseMarkdownToBoard(activeEditor.document.getText());

            // Move completed cards to archive
            const completedCards = [];
            for (const lane of board.children) {
                const remaining = [];
                for (const card of lane.children) {
                    if (card.data.isComplete) {
                        completedCards.push(card);
                    } else {
                        remaining.push(card);
                    }
                }
                lane.children = remaining;
            }

            board.data.archive.push(...completedCards);

            // Update document
            const markdown = boardToMarkdown(board);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                activeEditor.document.uri,
                new vscode.Range(0, 0, activeEditor.document.lineCount, 0),
                markdown
            );
            await vscode.workspace.applyEdit(edit);

            vscode.window.showInformationMessage(`Archived ${completedCards.length} completed cards`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to archive cards: ${error}`);
        }
    });

    context.subscriptions.push(
        createBoardCommand,
        openAsKanbanCommand,
        openAsMarkdownCommand,
        archiveCompletedCommand
    );

    // Register context for when clause in package.json
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const isKanbanFile = editor.document.getText().includes(frontmatterKey);
            vscode.commands.executeCommand('setContext', 'kanbanView', isKanbanFile);
        }
    });
}

export function deactivate() { }

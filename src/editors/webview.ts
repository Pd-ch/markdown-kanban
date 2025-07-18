import * as vscode from 'vscode';
import { Board } from '../types';

export class KanbanWebviewProvider {
    private currentBoard: Board | null = null;

    constructor(
        private readonly webview: vscode.Webview,
        private readonly extensionUri: vscode.Uri
    ) {
        this.webview.html = this.getHtmlForWebview();
    }

    public updateBoard(board: Board) {
        this.currentBoard = board;
        this.webview.postMessage({
            type: 'updateBoard',
            board: board
        });
    }

    public reinitialize() {
        // Re-set the HTML content to fix white screen issues
        this.webview.html = this.getHtmlForWebview();

        // Wait a bit longer before sending updates to ensure webview is ready
        setTimeout(() => {
            if (this.currentBoard) {
                this.updateBoard(this.currentBoard);
            }
        }, 200);
    }

    private getHtmlForWebview(): string {
        // Get path to resource on disk
        const scriptUri = this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js')
        );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kanban Board</title>
      </head>
      <body>
        <div id="kanban-root">
          <div class="kanban-container">
            <div class="kanban-header">
              <h1>Kanban Board</h1>
              <div class="kanban-actions">
                <button id="view-markdown-btn" class="action-btn">View as Markdown</button>
              </div>
            </div>
            <div id="kanban-board" class="kanban-board">
              <!-- Lanes will be rendered here -->
            </div>
          </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

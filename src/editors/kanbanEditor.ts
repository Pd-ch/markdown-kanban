import * as vscode from 'vscode';
import { KanbanDocument, Board, Item } from '../types';
import { parseMarkdownToBoard, boardToMarkdown } from '../parsers/markdown';
import { KanbanWebviewProvider } from './webview';

export class KanbanEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new KanbanEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            KanbanEditorProvider.viewType,
            provider
        );
        return providerRegistration;
    }

    private static readonly viewType = 'kanban.board';

    // 维护board状态
    private currentBoard: Board | null = null;
    private currentDocument: vscode.TextDocument | null = null;
    private webviewProvider: KanbanWebviewProvider | null = null;

    constructor(private readonly context: vscode.ExtensionContext) { }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        // Store document reference
        this.currentDocument = document;

        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        // Create webview provider
        this.webviewProvider = new KanbanWebviewProvider(
            webviewPanel.webview,
            this.context.extensionUri
        );

        // 初始读取并解析markdown文件
        await this.loadBoardFromDocument();

        let isUpdatingFromWebview = false;

        const updateWebviewFromDocument = async () => {
            if (isUpdatingFromWebview) return; // Prevent infinite loop

            try {
                await this.loadBoardFromDocument();
                this.refreshWebview();
            } catch (error) {
                console.error('Failed to parse markdown:', error);
                vscode.window.showErrorMessage('Failed to parse Kanban board');
            }
        };

        // Hook up event handlers so that we can synchronize the webview with the text document
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(async e => {
            if (e.document.uri.toString() === document.uri.toString() && !isUpdatingFromWebview) {
                await updateWebviewFromDocument();
            }
        });

        // Handle webview visibility changes to fix white screen issue
        webviewPanel.onDidChangeViewState(async e => {
            if (webviewPanel.visible) {
                // Reinitialize webview content when it becomes visible
                this.webviewProvider?.reinitialize();
                await updateWebviewFromDocument();
            }
        });

        // Make sure we get rid of the listener when our editor is closed
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Receive message from the webview
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
            isUpdatingFromWebview = true;
            try {
                switch (message.type) {
                    case 'updateCard':
                        try {
                            if (this.currentBoard) {
                                const card = this.findCardById(this.currentBoard, message.cardId);
                                if (card) {
                                    // 只允许更新完成状态，不允许修改标题
                                    card.data.isComplete = message.isComplete;
                                    await this.saveBoardToDocument();
                                    this.refreshWebview();
                                }
                            }
                        } catch (error) {
                            console.error('Failed to update card:', error);
                            vscode.window.showErrorMessage('Failed to update card');
                        }
                        break;
                    case 'moveCard':
                        try {
                            if (this.currentBoard) {
                                const cardToMove = this.findCardById(this.currentBoard, message.cardId);
                                if (cardToMove) {
                                    // Create a copy of the card
                                    const cardCopy = JSON.parse(JSON.stringify(cardToMove));

                                    // Remove the card from its current location
                                    this.removeCardById(this.currentBoard, message.cardId);

                                    // Add to target lane
                                    const targetLane = this.currentBoard.children.find(l => l.id === message.targetLaneId);
                                    if (targetLane) {
                                        targetLane.children.splice(message.targetIndex, 0, cardCopy);
                                    }

                                    await this.saveBoardToDocument();
                                    this.refreshWebview();
                                }
                            }
                        } catch (error) {
                            console.error('Failed to move card:', error);
                            vscode.window.showErrorMessage('Failed to move card');
                        }
                        break;
                    case 'openAsMarkdown':
                        // Switch to the default text editor for this document
                        vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
                        break;
                }
            } finally {
                isUpdatingFromWebview = false;
            }
        });

        // Initial update
        this.refreshWebview();
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    // 从文档加载board到内存
    private async loadBoardFromDocument(): Promise<void> {
        if (!this.currentDocument) return;

        try {
            this.currentBoard = await parseMarkdownToBoard(this.currentDocument.getText());
        } catch (error) {
            console.error('Failed to load board from document:', error);
            // 如果解析失败，创建一个空的board
            this.currentBoard = {
                id: this.generateId(),
                data: {
                    settings: {},
                    frontmatter: {},
                    archive: [],
                    isSearching: false,
                    errors: [],
                },
                children: []
            };
        }
    }

    // 将内存中的board保存到文档
    private async saveBoardToDocument(): Promise<void> {
        if (!this.currentBoard || !this.currentDocument) return;

        try {
            const markdown = boardToMarkdown(this.currentBoard);
            await this.updateTextDocument(this.currentDocument, markdown);
        } catch (error) {
            console.error('Failed to save board to document:', error);
            throw error;
        }
    }

    // 刷新webview界面
    private refreshWebview(): void {
        if (this.currentBoard && this.webviewProvider) {
            this.webviewProvider.updateBoard(this.currentBoard);
        }
    }

    private findCardById(board: Board, cardId: string): Item | null {
        for (const lane of board.children) {
            const card = this.findCardInItems(lane.children, cardId);
            if (card) return card;
        }
        return null;
    }

    private findCardInItems(items: Item[], cardId: string): Item | null {
        for (const item of items) {
            if (item.id === cardId) return item;
            const found = this.findCardInItems(item.children, cardId);
            if (found) return found;
        }
        return null;
    }

    private removeCardById(board: Board, cardId: string): boolean {
        for (const lane of board.children) {
            if (this.removeCardFromItems(lane.children, cardId)) {
                return true;
            }
        }
        return false;
    }

    private removeCardFromItems(items: Item[], cardId: string): boolean {
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === cardId) {
                items.splice(i, 1);
                return true;
            }
            if (this.removeCardFromItems(items[i].children, cardId)) {
                return true;
            }
        }
        return false;
    }

    private async updateTextDocument(document: vscode.TextDocument, content: string) {
        const edit = new vscode.WorkspaceEdit();

        // Get the full range of the document
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(
            firstLine.range.start,
            lastLine.range.end
        );

        edit.replace(document.uri, fullRange, content);

        const success = await vscode.workspace.applyEdit(edit);
        if (!success) {
            vscode.window.showErrorMessage('Failed to update document');
        }
        return success;
    }
}

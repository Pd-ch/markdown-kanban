import type { Board, Lane, Item, KanbanSettings } from '../types';
import { BoardTemplate, LaneTemplate, ItemTemplate } from '../types';

// Simple markdown parser implementation to avoid ES module issues
export async function parseMarkdownToBoard(content: string): Promise<Board> {
    const lines = content.split('\n');
    const board: Board = {
        ...BoardTemplate,
        id: generateId(),
        children: []
    };

    let currentLane: Lane | null = null;
    let frontmatterEnd = -1;
    let inFrontmatter = false;
    let frontmatterLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Handle frontmatter
        if (trimmedLine === '---') {
            if (i === 0) {
                inFrontmatter = true;
                frontmatterLines.push(line);
                continue;
            } else if (inFrontmatter) {
                frontmatterEnd = i;
                inFrontmatter = false;
                frontmatterLines.push(line);
                continue;
            }
        }

        if (inFrontmatter) {
            frontmatterLines.push(line);
            continue;
        }

        if (i <= frontmatterEnd) {
            continue;
        }

        // Handle lane headers (## Lane Name)
        if (trimmedLine.startsWith('## ')) {
            if (currentLane) {
                board.children.push(currentLane);
            }
            currentLane = {
                ...LaneTemplate,
                id: generateId(),
                data: {
                    title: trimmedLine.substring(3).trim(),
                },
                children: []
            };
            continue;
        }

        // Handle items (- [ ] Item text or - [x] Item text) with nesting support
        if (line.match(/^\s*- \[[\sx]\]/i) && currentLane) {
            const indentMatch = line.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1].length : 0;
            const level = Math.floor(indent / 2); // 2 spaces = 1 level

            const isCompleted = line.includes('[x]') || line.includes('[X]');
            const text = line.replace(/^\s*- \[[x\sX]*\]\s*/, '').trim();

            if (text) {
                const item: Item = {
                    ...ItemTemplate,
                    id: generateId(),
                    data: {
                        title: text,
                        isComplete: isCompleted,
                        level: level,
                    },
                    children: []
                };

                // Find the correct parent for this item
                if (level === 0) {
                    // Top level item
                    currentLane.children.push(item);
                } else {
                    // Find parent item at level-1
                    const parentItem = findParentItem(currentLane.children, level - 1);
                    if (parentItem) {
                        parentItem.children.push(item);
                    } else {
                        // If no parent found, add as top level
                        currentLane.children.push(item);
                    }
                }
            }
        }
    }

    // Add the last lane
    if (currentLane) {
        board.children.push(currentLane);
    }

    // Store frontmatter in board data
    if (frontmatterLines.length > 0) {
        board.data.frontmatter = { _raw: frontmatterLines.join('\n') };
    }

    return board;
}

export function boardToMarkdown(board: Board, settings?: KanbanSettings): string {
    const lines: string[] = [];

    // Add frontmatter
    if (board.data.frontmatter && board.data.frontmatter._raw) {
        lines.push(board.data.frontmatter._raw);
        lines.push('');
    } else if (settings && Object.keys(settings).length > 0) {
        lines.push('---');
        Object.entries(settings).forEach(([key, value]) => {
            lines.push(`${key}: ${value}`);
        });
        lines.push('---');
        lines.push('');
    }

    // Add lanes
    board.children.forEach(lane => {
        lines.push(`## ${lane.data.title}`);
        lines.push('');

        // Use the new rendering function for nested items
        if (lane.children.length > 0) {
            const itemsMarkdown = renderItemsToMarkdown(lane.children);
            lines.push(itemsMarkdown);
        }

        lines.push('');
    });

    return lines.join('\n').trim();
}

function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// Helper function to find parent item at specific level
function findParentItem(items: Item[], targetLevel: number): Item | null {
    // Find the last item at the target level (most recently added)
    let lastParent: Item | null = null;

    function searchItems(itemList: Item[]): void {
        for (const item of itemList) {
            if (item.data.level === targetLevel) {
                lastParent = item;
            }
            // Continue searching in children to find the most recent parent
            searchItems(item.children);
        }
    }

    searchItems(items);
    return lastParent;
}

// Helper function to render items with proper indentation
function renderItemsToMarkdown(items: Item[], baseIndent: string = ''): string {
    const lines: string[] = [];

    function renderItem(item: Item, currentIndent: string): void {
        const checkbox = item.data.isComplete ? '[x]' : '[ ]';
        lines.push(`${currentIndent}- ${checkbox} ${item.data.title}`);

        // Render children with increased indentation
        if (item.children.length > 0) {
            const childIndent = currentIndent + '  '; // Add 2 spaces for each level
            item.children.forEach(child => {
                renderItem(child, childIndent);
            });
        }
    }

    items.forEach(item => {
        renderItem(item, baseIndent);
    });

    return lines.join('\n');
}// Default settings
export const defaultSettings: KanbanSettings = {
    'kanban-plugin': 'board',
    'date-format': 'YYYY-MM-DD'
};

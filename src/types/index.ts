import * as vscode from 'vscode';

export interface KanbanSettings {
    'kanban-plugin'?: string;
    'date-format'?: string;
    'date-display-format'?: string;
    'time-format'?: string;
    'date-trigger'?: string;
    'time-trigger'?: string;
    'new-line-trigger'?: string;
    'new-card-insertion-method'?: 'prepend' | 'append';
    'show-checkboxes'?: boolean;
    'show-relative-date'?: boolean;
    'archive-date-format'?: string;
    'archive-date-separator'?: string;
    'max-archive-size'?: number;
    'metadata-keys'?: DataKey[];
    'tag-colors'?: TagColor[];
    'date-colors'?: DateColor[];
    'tag-sort'?: TagSort[];
    'show-add-list'?: boolean;
    'show-archive-all'?: boolean;
    'show-view-as-markdown'?: boolean;
    'show-board-settings'?: boolean;
    'show-search'?: boolean;
    'show-set-view'?: boolean;
    'lane-width'?: number;
    'list-collapse'?: boolean;
    'inline-metadata-position'?: 'top' | 'bottom' | 'body';
    'move-dates'?: boolean;
    'move-tags'?: boolean;
    'move-task-metadata'?: boolean;
    'link-date-to-daily-note'?: boolean;
    'tag-action'?: 'obsidian' | 'none';
    'new-note-folder'?: string;
    'new-note-template'?: string;
    'table-sizing'?: 'auto' | 'fixed';
}

export interface DataKey {
    metadataKey: string;
    label: string;
    shouldHideLabel: boolean;
    containsMarkdown: boolean;
}

export interface TagColor {
    tagKey: string;
    color: string;
    backgroundColor: string;
}

export interface DateColor {
    isToday?: boolean;
    isBefore?: boolean;
    isAfter?: boolean;
    distance?: number;
    unit?: 'hours' | 'days' | 'weeks' | 'months';
    direction?: 'before' | 'after';
    color?: string;
    backgroundColor?: string;
}

export interface TagSort {
    tag: string;
}

export interface LaneData {
    shouldMarkItemsComplete?: boolean;
    title: string;
    maxItems?: number;
    forceEditMode?: boolean;
    sorted?: LaneSort | string;
}

export interface LaneSort {
    criteria: 'date' | 'text' | 'tags' | 'manual';
    direction: 'asc' | 'desc';
}

export interface ItemData {
    title: string;
    isComplete: boolean;
    forceEditMode?: boolean;
    level?: number; // 缩进级别，0为顶级
}

export interface Item {
    id: string;
    data: ItemData;
    children: Item[]; // 支持嵌套子项
}

export interface Lane {
    id: string;
    data: LaneData;
    children: Item[];
}

export interface Board {
    id: string;
    data: {
        settings: KanbanSettings;
        frontmatter: Record<string, any>;
        archive: Item[];
        isSearching: boolean;
        errors: string[];
    };
    children: Lane[];
}

export interface KanbanDocument {
    uri: vscode.Uri;
    content: string;
    board: Board;
    version: number;
}

export const frontmatterKey = 'kanban-plugin';
export const completeString = '**Complete**';
export const archiveString = '***';

export const basicFrontmatter = [
    '---',
    '',
    `${frontmatterKey}: board`,
    '',
    '---',
    '',
    ''
].join('\n');

// Template objects
export const ItemTemplate: Item = {
    id: '',
    data: {
        title: '',
        isComplete: false,
        level: 0,
    },
    children: [],
};

export const LaneTemplate: Lane = {
    id: '',
    data: {
        title: '',
    },
    children: [],
};

export const BoardTemplate: Board = {
    id: '',
    data: {
        settings: {},
        frontmatter: {},
        archive: [],
        isSearching: false,
        errors: [],
    },
    children: [],
};

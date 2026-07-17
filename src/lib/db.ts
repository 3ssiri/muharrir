import Dexie, { type Table } from 'dexie';

export type ChatSession = {
    id?: number;
    title: string;
    previewText: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ChatMessage = {
    id?: number;
    sessionId: number;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    createdAt: Date;
    // Vercel AI SDK specific fields
    toolInvocations?: any[];
    data?: any;
    annotations?: any[];
    // Attached file info - supports multiple files
    file?: {
        name: string;
        type: string;
        preview?: string;
    };
    files?: Array<{
        name: string;
        type: string;
        preview?: string;
    }>;
    // Error state
    error?: {
        type: 'network' | 'auth' | 'quota' | 'server' | 'unknown';
        message: string;
        retryCount?: number;
    };
}

export type FavoritePrompt = {
    id?: number;
    title: string;
    content: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class PromptIteratorDB extends Dexie {
    chatSessions!: Table<ChatSession>;
    messages!: Table<ChatMessage>;
    favoritePrompts!: Table<FavoritePrompt>;

    constructor() {
        super('PromptIteratorDB');
        this.version(1).stores({
            chatSessions: '++id, title, updatedAt, createdAt',
            messages: '++id, sessionId, role, createdAt'
        });
        this.version(2).stores({
            chatSessions: '++id, title, updatedAt, createdAt',
            messages: '++id, sessionId, role, createdAt',
            favoritePrompts: '++id, title, content, updatedAt, createdAt'
        });
    }
}

export const db = new PromptIteratorDB();

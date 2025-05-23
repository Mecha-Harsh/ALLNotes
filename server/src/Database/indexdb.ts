// db.ts - Enhanced version
import { openDB, IDBPDatabase, DBSchema } from 'idb';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
  tags?: string[];
}

// Define the database schema
interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'updatedAt': number;
      'createdAt': number;
    };
  };
}


const DB_NAME = 'all-notes-db';
const STORE_NAME = 'notes';

let dbPromise: Promise<IDBPDatabase>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
};

export const saveNote = async (note: Note): Promise<string> => {
  const db = await initDB();
  // Ensure createdAt is set if this is a new note
  if (!note.createdAt) {
    note.createdAt = Date.now();
  }
  // Always update the updatedAt timestamp
  note.updatedAt = Date.now();
  await db.put(STORE_NAME, note);
  return note.id;
};

export const getNote = async (id: string): Promise<Note | undefined> => {
  const db = await initDB();
  return await db.get(STORE_NAME, id);
};

export const getAllNotes = async (): Promise<Note[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getNotesSortedByUpdatedAt = async (limit?: number): Promise<Note[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('updatedAt');
  
  // Get all notes ordered by updatedAt in descending order (newest first)
  const notes = await index.getAll(undefined, limit);
  await tx.done;
  return notes.reverse();
};

export const searchNotes = async (query: string): Promise<Note[]> => {
  const db = await initDB();
  const allNotes = await db.getAll(STORE_NAME);
  
  // Simple search implementation
  const lowerQuery = query.toLowerCase();
  return allNotes.filter(note => 
    note.title.toLowerCase().includes(lowerQuery) || 
    note.content.toLowerCase().includes(lowerQuery)
  );
};

export const deleteNote = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const deleteAllNotes = async (): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
};

// Get the count of notes
export const getNotesCount = async (): Promise<number> => {
  const db = await initDB();
  return await db.count(STORE_NAME);
};
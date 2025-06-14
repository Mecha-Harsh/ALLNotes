// noteSyncUtils.ts
import axios, { type AxiosResponse } from 'axios';
// Adjust path as needed
import * as Y from 'yjs';
import getAuthToken from '../../utils/getToken';

// Types
interface NoteData {
  content: string;
  updatedAt: string;
  title: string;
  success: boolean;
  error?: string;
}

interface SyncResult {
  success: boolean;
  updated?: boolean;
  message: string;
  content?: string;
  updatedAt?: string;
  error?: string;
}

interface ServerNoteResponse {
  content: string;
  updatedAt: string;
  title: string;
  [key: string]: any;
}

interface SyncMetadata {
  key: string;
  value: string;
}

/**
 * Fetches the latest note from the server
 */
export const fetchLatestNote = async (roomId: string): Promise<NoteData> => {
  const token = getAuthToken();
  
  try {
    const response = await axios.get(
      'http://localhost:8080/get_note', 
      {
        params: { id: roomId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      content: response.data.content || '',
      updatedAt: response.data.updatedat,
      title: response.data.title || 'Untitled',
      success: true
    };
  } catch (error: any) {
    console.error('Failed to fetch latest note:', error);
    return {
      content: '',
      updatedAt: '',
      title: 'Untitled',
      success: false,
      error: error.message
    };
  }
};

/**
 * Gets the last sync timestamp from IndexedDB using the Yjs structure
 */
export const getLastSyncTimestamp = async (noteId: string): Promise<string | null> => {
  try {
    // Yjs uses the noteId as the database name
    const dbName = noteId;
    
    return new Promise<string | null>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        resolve(null);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Check if sync_metadata store exists
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.close();
          resolve(null);
          return;
        }
        
        const transaction = db.transaction(['sync_metadata'], 'readonly');
        const store = transaction.objectStore('sync_metadata');
        const getRequest = store.get('lastSyncTimestamp');
        
        getRequest.onsuccess = () => {
          db.close();
          const result = getRequest.result as SyncMetadata | undefined;
          resolve(result?.value || null);
        };
        
        getRequest.onerror = () => {
          console.error('Error getting sync timestamp:', getRequest.error);
          db.close();
          resolve(null);
        };
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB for sync timestamp:', error);
    return null;
  }
};

/**
 * Saves the last sync timestamp to IndexedDB
 */
export const saveLastSyncTimestamp = async (noteId: string, timestamp: string): Promise<void> => {
  try {
    const dbName = noteId;
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB for save:', request.error);
        reject(request.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
          console.log('Created sync_metadata store');
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Ensure the store exists
        if (!db.objectStoreNames.contains('sync_metadata')) {
          // Need to close and reopen with version upgrade
          const currentVersion = db.version;
          db.close();
          
          const upgradeRequest = indexedDB.open(dbName, currentVersion + 1);
          
          upgradeRequest.onupgradeneeded = (event) => {
            const upgradeDb = (event.target as IDBOpenDBRequest).result;
            if (!upgradeDb.objectStoreNames.contains('sync_metadata')) {
              upgradeDb.createObjectStore('sync_metadata', { keyPath: 'key' });
            }
          };
          
          upgradeRequest.onsuccess = () => {
            const upgradeDb = upgradeRequest.result;
            const transaction = upgradeDb.transaction(['sync_metadata'], 'readwrite');
            const store = transaction.objectStore('sync_metadata');
            
            store.put({ key: 'lastSyncTimestamp', value: timestamp });
            
            transaction.oncomplete = () => {
              upgradeDb.close();
              resolve();
            };
            
            transaction.onerror = () => {
              upgradeDb.close();
              reject(transaction.error);
            };
          };
          
          upgradeRequest.onerror = () => {
            reject(upgradeRequest.error);
          };
          
          return;
        }
        
        const transaction = db.transaction(['sync_metadata'], 'readwrite');
        const store = transaction.objectStore('sync_metadata');
        
        store.put({ key: 'lastSyncTimestamp', value: timestamp });
        
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  } catch (error) {
    console.error('Error saving sync timestamp:', error);
    throw error;
  }
};

/**
 * Gets the current Yjs document state to check if it has content
 */
export const getYjsDocumentState = (ydoc: Y.Doc, textFieldName: string = 'quill'): { hasContent: boolean; textLength: number } => {
  try {
    const ytext = ydoc.getText(textFieldName);
    const textLength = ytext.length;
    
    return {
      hasContent: textLength > 0,
      textLength
    };
  } catch (error) {
    console.error('Error getting Yjs document state:', error);
    return { hasContent: false, textLength: 0 };
  }
};

/**
 * METHOD 1: Updates Quill content directly (RECOMMENDED - Preserves formatting)
 * This method sets HTML content directly to Quill, preserving all formatting
 */
export const updateQuillContent = (content: string, quillInstance: any): void => {
  try {
    if (!content.trim()) {
      quillInstance.setText('');
      console.log('Cleared Quill content');
      return;
    }
    
    // Set HTML content directly to Quill's editor
    quillInstance.root.innerHTML = content;
    console.log('Quill content updated with HTML formatting preserved');
    
  } catch (error) {
    console.error('Error updating Quill content:', error);
  }
};

/**
 * METHOD 2: Converts HTML content to plain text and updates Yjs document (LEGACY - Loses formatting)
 * This is the old method that loses formatting - kept for backward compatibility
 */
export const updateYjsContent = (ydoc: Y.Doc, content: string, textFieldName: string = 'quill'): void => {
  try {
    const ytext = ydoc.getText(textFieldName);
    
    // Clear existing content
    const currentLength = ytext.length;
    if (currentLength > 0) {
      ytext.delete(0, currentLength);
    }
    
    // Convert HTML to plain text (this loses formatting)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (plainText.trim()) {
      ytext.insert(0, plainText);
    }
    
    console.log('Yjs content updated (formatting lost), new length:', ytext.length);
  } catch (error) {
    console.error('Error updating Yjs content:', error);
  }
};

/**
 * Checks if the Yjs IndexedDB has any stored data
 */
export const checkYjsIndexedDBContent = async (noteId: string): Promise<boolean> => {
  try {
    const dbName = noteId;
    
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open(dbName);
      
      request.onerror = () => {
        console.error('Error checking Yjs IndexedDB:', request.error);
        resolve(false);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Check if the expected Yjs stores exist
        const hasCustomStore = db.objectStoreNames.contains('custom');
        const hasUpdateStore = db.objectStoreNames.contains('update');
        
        if (!hasCustomStore && !hasUpdateStore) {
          db.close();
          resolve(false);
          return;
        }
        
        // Check if update store has any data
        if (hasUpdateStore) {
          const transaction = db.transaction(['update'], 'readonly');
          const store = transaction.objectStore('update');
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            const count = countRequest.result;
            db.close();
            resolve(count > 0);
          };
          
          countRequest.onerror = () => {
            db.close();
            resolve(false);
          };
        } else {
          db.close();
          resolve(false);
        }
      };
    });
  } catch (error) {
    console.error('Error checking Yjs IndexedDB content:', error);
    return false;
  }
};

/**
 * Main function to sync the latest note with local storage
 * Updated to support both methods of content updating
 */
export const syncLatestNote = async (
  noteId: string, 
  ydoc: Y.Doc, 
  quillInstance?: any, // Optional Quill instance for Method 1 (recommended)
  textFieldName: string = 'quill'
): Promise<SyncResult> => {
  try {
    console.log('Starting note sync for noteId:', noteId);
    
    // Check if local Yjs document has content
    const localDocState = getYjsDocumentState(ydoc, textFieldName);
    console.log('Local document state:', localDocState);
    
    // Get the last sync timestamp from local storage
    const lastSyncTimestamp = await getLastSyncTimestamp(noteId);
    console.log('Last sync timestamp:', lastSyncTimestamp);
    
    // Fetch the latest note from server
    const noteData = await fetchLatestNote(noteId);
    
    if (!noteData.success) {
      return {
        success: false,
        message: 'Failed to fetch latest note from server',
        error: noteData.error
      };
    }
    
    console.log('Server note updatedAt:', noteData.updatedAt);
    
    // If no content on server and no local content, nothing to sync
    if (!noteData.content.trim() && !localDocState.hasContent) {
      console.log('No content on server or locally, nothing to sync');
      return {
        success: true,
        updated: false,
        message: 'No content to sync',
        content: noteData.content,
        updatedAt: noteData.updatedAt
      };
    }
    
    // Check if server note is newer than local
    const serverTimestamp = new Date(noteData.updatedAt);
    const localTimestamp = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
    
    console.log('Server timestamp:', serverTimestamp);
    console.log('Local timestamp:', localTimestamp);
    
    // If server is newer or if local document is empty but server has content
    if (serverTimestamp > localTimestamp || (!localDocState.hasContent && noteData.content.trim())) {
      console.log('Server note is newer or local is empty, updating local content');
      
      // METHOD 1: Use Quill instance to preserve formatting (RECOMMENDED)
      if (quillInstance) {
        console.log('Using Method 1: Direct Quill update (formatting preserved)');
        updateQuillContent(noteData.content, quillInstance);
      } else {
        // METHOD 2: Fallback to Yjs update (formatting lost)
        console.warn('Using Method 2: Yjs update (formatting will be lost)');
        console.warn('Consider passing quillInstance parameter to preserve formatting');
        updateYjsContent(ydoc, noteData.content, textFieldName);
      }
      
      // Save the new sync timestamp
      await saveLastSyncTimestamp(noteId, noteData.updatedAt);
      
      return {
        success: true,
        updated: true,
        message: quillInstance 
          ? 'Note synchronized with server (formatting preserved)' 
          : 'Note synchronized with server (formatting may be lost)',
        content: noteData.content,
        updatedAt: noteData.updatedAt
      };
    } else {
      console.log('Local note is up to date or newer');
      
      // Still update the sync timestamp if they're equal
      if (serverTimestamp.getTime() === localTimestamp.getTime()) {
        await saveLastSyncTimestamp(noteId, noteData.updatedAt);
      }
      
      return {
        success: true,
        updated: false,
        message: 'Local note is already up to date',
        content: noteData.content,
        updatedAt: noteData.updatedAt
      };
    }
  } catch (error: any) {
    console.error('Error during note sync:', error);
    return {
      success: false,
      message: 'Error during note synchronization',
      error: error.message
    };
  }
};

/**
 * Initialize sync metadata store in IndexedDB
 */
export const initializeSyncMetadata = async (noteId: string): Promise<boolean> => {
  try {
    const dbName = noteId;
    
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open(dbName);
      
      request.onerror = () => {
        console.error('Error initializing sync metadata:', request.error);
        resolve(false);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
          console.log('Created sync_metadata store');
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        db.close();
        console.log('Sync metadata initialized successfully');
        resolve(true);
      };
    });
  } catch (error) {
    console.error('Error initializing sync metadata:', error);
    return false;
  }
};

/**
 * Clears the sync metadata (useful for testing or resetting)
 */
export const clearSyncMetadata = async (noteId: string): Promise<boolean> => {
  try {
    const dbName = noteId;
    
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open(dbName);
      
      request.onerror = () => {
        console.error('Error clearing sync metadata:', request.error);
        resolve(false);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.close();
          resolve(true);
          return;
        }
        
        const transaction = db.transaction(['sync_metadata'], 'readwrite');
        const store = transaction.objectStore('sync_metadata');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          db.close();
          console.log('Sync metadata cleared successfully');
          resolve(true);
        };
        
        clearRequest.onerror = () => {
          db.close();
          console.error('Error clearing sync metadata:', clearRequest.error);
          resolve(false);
        };
      };
    });
  } catch (error) {
    console.error('Error clearing sync metadata:', error);
    return false;
  }
};
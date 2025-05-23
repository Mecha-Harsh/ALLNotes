function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MyNotesDB", 1);
  
      request.onerror = () => {
        reject("Failed to open DB");
      };
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }

  
  export async function addNote(note: { id: string; title: string; content: string , updatedAt : string, synced : boolean}) {
    const db = await openDB();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    store.add(note);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  


  export async function getAllNotes(): Promise<any[]> {
    const db = await openDB();
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
  
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("Failed to fetch notes");
    });
  }
  

  export async function updateNoteById(id: string, updatedFields: { title?: string; content?: string }) {
    const db = await openDB();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
  
    const getRequest = store.get(id);
  
    return new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const note = getRequest.result;
  
        if (!note) {
          reject(new Error("Note not found"));
          return;
        }
  
        // Update the fields
        if (updatedFields.title !== undefined) note.title = updatedFields.title;
        if (updatedFields.content !== undefined) note.content = updatedFields.content;
        note.updatedAt = new Date().toISOString(); // Optional: track last update time
        note.synced = false; // Optional: mark as not yet synced to server
  
        const putRequest = store.put(note);
  
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error("Failed to update note"));
      };
  
      getRequest.onerror = () => reject(new Error("Failed to fetch note"));
    });
  }
  
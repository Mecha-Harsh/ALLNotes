
export const clearIndexedDBForRoom = (roomName:string) => {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(`y-indexeddb-${roomName}`)
      
      deleteRequest.onsuccess = () => {
        console.log(`Cleared IndexedDB for room: ${roomName}`)
        resolve(true);
      }
      
      deleteRequest.onerror = () => {
        console.error('Error clearing IndexedDB')
        reject(deleteRequest.error)
      }
      
      deleteRequest.onblocked = () => {
        console.warn('IndexedDB deletion blocked - close other tabs with this document')
        // Still resolve after a timeout
        setTimeout(() => resolve(false), 1000)
      }
    })
  }
  
  export const fetchLatestFromServer = async (roomName:string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/documents/${roomName}/latest`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error fetching latest from server:', error)
      return null
    }
  }
  
  
  
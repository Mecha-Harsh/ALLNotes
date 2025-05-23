// // test.ts - Enhanced version
// import { 
//   saveNote, 
//   getAllNotes, 
//   getNote, 
//   deleteNote, 
//   getNotesSortedByUpdatedAt,
//   searchNotes,
//   getNotesCount
// } from './Database/indexdb';

// (async () => {
//   console.log('Testing IndexedDB operations...');

//   // Create multiple notes
//   const noteIds = []; 

//   noteIds.push(await saveNote({
//     id: 'note-1',
//     title: 'First Test Note',
//     content: 'This is the first test note.',
//     updatedAt: Date.now(),
//     createdAt: Date.now() - 3000, // 3 seconds ago
//     tags: ['test', 'first']
//   }));

//   // Wait a bit to ensure different timestamps
//   await new Promise(resolve => setTimeout(resolve, 1000));
  
//   noteIds.push(await saveNote({
//     id: 'note-2',
//     title: 'Second Test Note',
//     content: 'This is the second test note with more content.',
//     updatedAt: Date.now(),
//     createdAt: Date.now(),
//     tags: ['test', 'second']
//   }));

//   // Get all notes
//   const allNotes = await getAllNotes();
//   console.log('All notes:', allNotes);

//   // Get a specific note
//   const specificNote = await getNote('note-1');
//   console.log('Note with ID note-1:', specificNote);

//   // Get notes sorted by updatedAt  
//   const sortedNotes = await getNotesSortedByUpdatedAt();
//   console.log('Notes sorted by updatedAt (newest first):', sortedNotes);
  
//   // Search for notes
//   const searchResults = await searchNotes('second');
//   console.log('Search results for "second":', searchResults);
  
//   // Get count of notes
//   const count = await getNotesCount();
//   console.log('Total notes count:', count);
  
//   // Update a note
//   if (specificNote) {
//     specificNote.content = 'This content has been updated';
//     await saveNote(specificNote);
    
//     const updatedNote = await getNote('note-1');
//     console.log('Updated note:', updatedNote);
//   }
  
//   // Delete a note
//   await deleteNote('note-1');
//   const remainingNotes = await getAllNotes();
//   console.log('Notes after deletion:', remainingNotes);

//   console.log('IndexedDB test completed successfully!');
// })().catch(error => {
//   console.error('Error during IndexedDB test:', error);
// });
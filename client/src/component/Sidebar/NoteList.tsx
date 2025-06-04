import React, { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../Context/context';
import { getAllNotes, addNote } from '../../IndexDB/db';
import { v4 as uuidv4 } from 'uuid';

interface Notes {
  userId:string;
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  synced: boolean;
}

export const NoteList = () => {
  const { userId, id, setId, notes, setNotes } = useGlobalContext();
  const navigate = useNavigate();

  const formatTitle = (content: string): string => {
    const plainText = content.replace(/<[^>]+>/g, '');
    return plainText || 'Untitled';
  };
  console.log("the id at note list: ",id);
  const fetchNotes = useCallback(async () => {
    try {
      const allNotes = await getAllNotes(userId);
      setNotes(allNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [setNotes]);

  const handleNewNote = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newNote: Notes = {
      userId: userId,
      id: uuidv4(),
      title: '<h2>Untitled</h2>',
      content: '<p>Change Meee!!!!!!</p>',
      updatedAt: new Date().toISOString(),
      synced: true,
    };
  
    try {
      // Always add the note locally
      await addNote(newNote);
      setNotes((prevNotes) => [...prevNotes, newNote]);
  
      // Only sync to cloud if user is not a guest
      if (userId !== "Guest") {
        await axios.post('http://localhost:8080/add_notes', {
          userId: newNote.userId,
          id: newNote.id,
          title: newNote.title,
          content: newNote.content,
          updated_at: newNote.updatedAt,
        });
      }
    } catch (err) {
      console.error('Error creating new note:', err);
      await fetchNotes();
    }
  };
  

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <aside className="w-64 h-screen bg-[#1e1e1e] text-white border-r border-gray-800 p-4 flex flex-col">
      <h1 className="text-xl font-semibold mb-6 tracking-tight">All Notes</h1>

      <button
        onClick={handleNewNote}
        className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg mb-6 transition"
      >
        + New Note
      </button>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              onClick={() => setId(note.id)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                id === note.id
                  ? 'bg-gray-600 font-medium'
                  : 'hover:bg-gray-800'
              }`}
            >
              {formatTitle(note.title)}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default NoteList;

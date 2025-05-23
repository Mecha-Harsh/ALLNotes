import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../../Context/context'
import { getAllNotes,addNote } from '../../IndexDB/db'
import { v4 as uuidv4 } from "uuid";


interface Notes {
  id: string;
  title: string;
  content: string;
  updatedAt:string;
  synced : boolean;
}


export const NoteList= () => {
    const {id,setId,notes,setNotes} = useGlobalContext();
    const navigate = useNavigate();


    console.log(id);
    const formatTitle = (content:string):string=>{
      const plainText = content.replace(/<[^>]+>/g, ''); 
      return plainText;
    }

    const handleNewNote = async(e: React.FormEvent) => {
      e.preventDefault(); // Prevent form submission
      const newNote :Notes ={
        id:uuidv4(),
        title:"<h2>Untitled</h2>",
        content:"<p>Chanhge Meee!!!!!!</p>",
        updatedAt: new Date().toISOString(),
        synced:false
      } 
      try {
        // Create a new empty note with a placeholder title
        const response = addNote(newNote);
  
      } catch (err) {
        console.error("Error creating new note:", err);
      }
      }

      useEffect(() => {
        getAllNotes().then(setNotes)
      }, [handleNewNote]);
    
  return (
    <div>
        <h2>Your Notes</h2>
        <ul className='space-y-2'>
            {notes.map(note=>(
               <li
               key={note.id}
               onClick={() => setId(note.id)}
               className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                >
               {formatTitle(note.title) || "Untitled"}
             </li>
            ))}
            <button onClick={handleNewNote}>New Notes</button>
        </ul>
    </div>
  )
}

export default NoteList;
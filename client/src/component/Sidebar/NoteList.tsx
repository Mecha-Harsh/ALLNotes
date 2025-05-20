import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../../Context/context'

// interface prop {
//     id:number,
//     title:string
// }




export const NoteList= () => {
    const {id,setId,notes,setNotes} = useGlobalContext();
    const navigate = useNavigate();
    // const titles = useState<titelStack[]>([]);
    //const [notes, setNotes] = useState<Note[]>([]);


    const formatTitle = (content:string):string=>{
      const plainText = content.replace(/<[^>]+>/g, ''); 
      return plainText;
    }

    const handleNewNote = async(e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        
        try {
          // Create a new empty note with a placeholder title
          const res = await axios.post("http://localhost:8080/add_notes");
          
          const noteId = res.data.id;
          console.log(noteId);
            setId(noteId); // Fixed URL format (removed "Id=")
        } catch (err) {
          console.error("Error creating new note:", err);
        }
      }

    useEffect(() => {
        axios.get('http://localhost:8080/notes')
          .then(res => setNotes(res.data))
          .catch(err => console.log(err));
      }, []);
    
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
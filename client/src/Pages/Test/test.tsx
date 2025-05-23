import React, { useState , useEffect} from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from "uuid";
 import { addNote,getAllNotes } from '../../IndexDB/db';

interface note{
    id:string,
    title:string,
    content:string,
    synced:boolean,
    updatedAt:string
}

export const TestPage = () => {
    const [notes, setNotes] = useState<any[]>([]);

    useEffect(() => {
        getAllNotes().then(setNotes);
    }, []);


    const addnote= async(e:React.FormEvent)=> {
        e.preventDefault();
        const note = {
            id: uuidv4(), // 👈 generate your own ID
            title:"this is tille",
            content:"this is content",
            updatedAt: new Date().toISOString(),
            synced: false, // optional: use this to know if it's synced to cloud
          };
        
        const response = addNote(note);
        console.log(notes);
    }
    
    

    
    const[name,setName] = useState<string>("");
    const[age,setAge] = useState<number>();
    // const db =useLocalDB();
    const handlePage = async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const response =  await axios.post('http://localhost:8080/test',{
                name:name,
                age:age
            }
        );
        console.log('Server Response:', response.data);
        }catch{
            console.log("error")
        }
    }
  return (
    <div>
        <form onSubmit={addnote}>
            <p>Name:</p>
            <input value={name} onChange={(e)=>{setName(e.target.value)}}></input>
            <p>Age</p>
            <input value={age} type='number' onChange={(e)=>{setAge(Number(e.target.value))}}></input>
            <button type='submit'>submit</button>
        </form>
    </div>
  )
}

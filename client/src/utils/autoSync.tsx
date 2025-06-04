import { useGlobalContext } from "../Context/context";
import { getUnsyncedNotes,updateNoteSync } from "../IndexDB/db";
import axios from 'axios';

import React from 'react'

const autoSync= async(userId:string)=>{
    const unsycnedNotes  = await getUnsyncedNotes();
    if(userId!=="Guest"){
        try{
            for(const note of unsycnedNotes){
                try{
                    console.log(note);
                    const res = await axios.post("http://localhost:8080/update_notes",note);
                    console.log(res);
                    updateNoteSync(note.id, true);
                }catch(error){
                    console.log("error updating table: ",error);
                }
            }
    
            console.log("auto synced sucess");
        }catch{
            console.log("Auto synced failed");
        }
    }
    else{
        return;
    }
    
    
}

export default autoSync;
import axios from "axios";
import { useGlobalContext } from "../Context/context";
import { getAllNotes } from "../IndexDB/db";

export const syncNotes: any =async(userId:string)=>{

    const notesFromOffline = getAllNotes(userId);
    try{
        const notesFromOnline = await axios.get("http://localhost:8080/getAllNotes",{params:{userId:userId}});
        console.log("the notes form online",notesFromOnline.data);
    }catch(e){
        console.log("error",e);
    }
}

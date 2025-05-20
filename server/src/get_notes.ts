import express from "express";
import pool from "./Database/db";
import { error } from "console";

const router = express.Router();

router.get('/notes',async(req,res)=>{
    try{
        const {id} = req.query;
        var result : any;
        const client = await pool.connect();
        if(id){
            result = await client.query("select * from notes where Id=$1",[id]);
        }
        else{result = await client.query("select * from notes");}
        client.release()
        res.json(result.rows);
    }catch{
        console.log("Internal server error");
        res.send(500).json({error:"Internal server error"});
    }
});

export default router;
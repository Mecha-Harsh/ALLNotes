import express from "express";
import cors from "cors";
import { json } from "stream/consumers";
import get_notes from "./get_notes";
import add_notes from "./add_notes"
import update_notes from "./update_notes"
import test from './Database/indexedb1';
const app = express();
const port = 8080;

const corsOption = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOption));
app.use(express.json()); // forget this fucker took my 1.5 hour to debug

app.get('/api',(req,res)=>{
    res.json({"msg":"hello"});
})
app.use('/update_notes',update_notes);
app.get('/notes',get_notes);
app.post('/add_notes',add_notes);
app.post('/test',test);
app.listen(port,()=>{
    console.log(`The app is listenin on the port ${port}`);
})

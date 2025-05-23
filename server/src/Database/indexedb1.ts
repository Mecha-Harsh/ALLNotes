import  express  from "express";

const router = express.Router();


router.post('/test',async(req,res)=>{
    const {name,age} = req.body;
    console.log(name,age);
})


// let db;
// const request = indexedDB.open("MyTestDatabase");
// request.onerror = (event) => {
//   console.error("Why didn't you allow my web app to use IndexedDB?!");
// };
// request.onsuccess = (event) => {
//   if (event.target) {
//     db = (event.target as IDBOpenDBRequest).result;
//   }
// };

export default router;
import express, { Request, Response } from "express";
import pool from "./Database/db";

const router = express.Router();


interface porp {
    req:Request,
    res:Response
}
// Fixed: Changed router.get to router.post since you're handling POST requests
router.post('/', async( req:Request, res:Response) : Promise<any>=> {
  try {
    const { id, title, content } = req.body;
    
    if (!id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields: id, title, or content" });
    }
    
    try {
      const client = await pool.connect();
      // Fixed: Added missing parameter to query and fixed 'returning' syntax
      const response = await client.query(
        'UPDATE notes SET body = $1, title = $2 WHERE id = $3 RETURNING *',
        [content, title, id]
      );
      
      client.release();
      
      // Return the updated record
      if (response.rows.length > 0) {
        return res.status(200).json(response.rows[0]);
      } else {
        return res.status(404).json({ error: "Note not found" });
      }
    } catch (dbError) {
      console.error("Database error updating notes:", dbError);
      return res.status(500).json({ error: "Error updating the database" });
    }
  } catch (error) {
    console.error("Error processing update request:", error);
    return res.status(400).json({ error: "Error processing update request" });
  }
});

export default router;
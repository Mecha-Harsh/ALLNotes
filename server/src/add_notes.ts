
import express, { Request, Response } from "express";
import pool from "./Database/db";
import { error } from "console";

// Create a router
const router = express.Router();

// Define routes on the router
router.post('/add_notes', async (req: Request, res: Response) => {
  try {
    const title = "Add a title";
    const content = "sample text";
    const client = await pool.connect();
    
    try {
      const response = await client.query(
        'INSERT INTO notes(title, body) VALUES ($1, $2) RETURNING id',
        [title, content]
      );
      res.status(201).json(response.rows[0]);
    }catch{
      console.log(error);
    } 
    finally {
      client.release();
    }
  } catch (err) {
    console.log("Error inserting data:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Export the router
export default router;
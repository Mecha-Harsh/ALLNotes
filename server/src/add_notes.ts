import express, { Request, Response } from "express";
import pool from "./Database/db";

// Create a router
const router = express.Router();

router.post('/add_notes', async (req: Request, res: Response) => {
  const { userId,id, title, content, updated_at } = req.body;

  try {
    const client = await pool.connect();
    try {
      const response = await client.query(
        'INSERT INTO notes(id, title, content, updated_at,owner) VALUES ($1, $2, $3, $4 ,$5) RETURNING id',
        [id, title, content, updated_at,userId]
      );
      res.status(201).json(response.rows[0]);
    } catch (err) {
      console.error("DB insert error:", err);
      res.status(500).json({ error: "Database insert failed" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

export default router;

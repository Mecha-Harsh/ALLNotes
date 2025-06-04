import express, { Request, Response } from "express";
import pool from "./Database/db";

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
  const { id, title, content, updatedAt, userId } = req.body;

  if (!id || !title || !content) {
    return res.status(400).json({ error: "Missing required fields: id, title, or content" });
  }

  let client;
  try {
    client = await pool.connect();

    // Ownership check
    const ownershipResult = await client.query(
      "SELECT 1 FROM notes WHERE id = $1 AND owner = $2",
      [id, userId]
    );
    if (ownershipResult.rows.length === 0) {
      return res.status(403).json({ error: "User does not own this note" });
      return;
    }

    // Update note
    const updateResult = await client.query(
      'UPDATE notes SET content = $1, title = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      [content, title, updatedAt, id]
    );

    if (updateResult.rows.length > 0) {
      return res.status(200).json(updateResult.rows[0]);
    } else {
      return res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    console.error("Error processing update request:", error);
    return res.status(500).json({ error: "Error processing update request" });
  } finally {
    if (client) client.release();
  }
});

export default router;

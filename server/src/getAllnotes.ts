import express from "express";
import pool from "./Database/db";
import { error } from "console";

const router = express.Router();

router.get('/', async (req, res) => {
    let client;
    try {
      const { userId } = req.query;
      client = await pool.connect();
  

      if (userId) {
      const result = await client.query("select * from notes where owner=$1 ORDER BY updated_at ASC", [userId]);
        res.json(result.rows);
      } 
     
    } catch (error) {
      console.error("Internal server error:", error);
      if (!res.headersSent) {  // check if headers already sent
        res.status(500).json({ error: "Internal server error" });
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  });
  

export default router;
import express from "express";
import pool from "./Database/db";
import { error } from "console";

const router = express.Router();

router.get('/notes', async (req, res) => {
    let client;
    try {
      const { id } = req.query;
      client = await pool.connect();
  
      let result;
      if (id) {
        result = await client.query("select * from notes where Id=$1 ORDER BY Id ASC", [id]);
      } else {
        result = await client.query("select * from notes ORDER BY Id ASC");
      }
  
      res.json(result.rows);
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
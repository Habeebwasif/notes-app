const express = require("express");
const mysql = require("mysql2/promise");

const PORT = process.env.PORT || 4000;
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "notesdb",
});

const app = express();
app.use(express.json());

// Allow the frontend (a different origin) to call this API
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  });
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok", db: "up" }); }
  catch { res.status(503).json({ status: "error", db: "down" }); }
});

app.get("/api/notes", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM notes ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/notes", async (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text || text.length > 280)
    return res.status(400).json({ error: "Note text is required (max 280 chars)." });
  const [r] = await pool.query("INSERT INTO notes (text) VALUES (?)", [text]);
  const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [r.insertId]);
  res.status(201).json(rows[0]);
});

app.patch("/api/notes/:id", async (req, res) => {
  const [r] = await pool.query("UPDATE notes SET done = NOT done WHERE id = ?", [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});

app.delete("/api/notes/:id", async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id = ?", [req.params.id]);
  res.status(204).end();
});

async function start() {
  // Retry: the database may still be starting up
  for (let i = 1; i <= 15; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(280) NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      break;
    } catch (e) {
      console.log(`MySQL not ready (${i}/15)...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, () => console.log(`API on :${PORT}`));
}
start();

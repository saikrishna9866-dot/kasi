import express from "express";
import cors from "cors";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Tesseract from "tesseract.js";
// @ts-ignore
import pdf from "pdf-parse";
import { parse as parseCsv } from "csv-parse/sync";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zuzbdwsfvhqetofbjiyv.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1emJkd3NmdmhxZXRvZmJqaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzUyMTcsImV4cCI6MjA5MDgxMTIxN30.OcGfSzviAKixdF9IaOaRMshewQvC-aigJTzvwt5399c";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gemini Setup
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

app.use(cors());
app.use(express.json());

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- API Routes ---

// 1. Transactions
app.post("/api/add-expense", async (req, res) => {
  const { user_id, amount, type, category, merchant, date, payment_method, tags } = req.body;
  
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ user_id, amount, type, category, merchant, date, payment_method, tags }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  
  // Trigger AI Insight generation (async)
  generateInsights(user_id);
  
  res.json(data);
});

app.get("/api/transactions", async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .order("date", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// 2. OCR Bill Processing
app.post("/api/upload-bill", upload.single("bill"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let text = "";
    if (req.file.mimetype === "application/pdf") {
      const data = await pdf(req.file.buffer);
      text = data.text;
    } else {
      const { data: { text: ocrText } } = await Tesseract.recognize(req.file.buffer, "eng");
      text = ocrText;
    }

    // Use Gemini to extract structured data from text
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract financial data from this bill text: "${text}". 
      Return a JSON object with: amount (number), merchant (string), date (ISO string), category (Food, Travel, Bills, Shopping, Others). 
      Return ONLY the JSON.`,
      config: { responseMimeType: "application/json" }
    });

    const response = await model;
    const extractedData = JSON.parse(response.text);

    res.json(extractedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to process bill" });
  }
});

// 3. Statement Processing
app.post("/api/upload-statement", upload.single("statement"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { user_id } = req.body;

  try {
    let transactions: any[] = [];
    if (req.file.mimetype === "text/csv") {
      const records = parseCsv(req.file.buffer, { columns: true });
      transactions = records.map((r: any) => ({
        user_id,
        amount: parseFloat(r.amount),
        merchant: r.merchant,
        date: new Date(r.date).toISOString(),
        category: categorizeMerchant(r.merchant),
        type: parseFloat(r.amount) < 0 ? "expense" : "income"
      }));
    } else if (req.file.mimetype === "application/pdf") {
      const data = await pdf(req.file.buffer);
      // Simplified PDF parsing logic - in real world would use more complex regex or AI
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract a list of transactions from this bank statement text: "${data.text}". 
        Return a JSON array of objects with: amount, merchant, date, type. 
        Return ONLY the JSON.`,
        config: { responseMimeType: "application/json" }
      });
      const response = await model;
      transactions = JSON.parse(response.text).map((t: any) => ({ ...t, user_id }));
    }

    const { data, error } = await supabase.from("transactions").insert(transactions).select();
    if (error) throw error;

    res.json({ count: data.length, transactions: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to process statement" });
  }
});

// 4. Analytics
app.get("/api/analytics", async (req, res) => {
  const { user_id } = req.query;

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id);

  if (error) return res.status(400).json({ error: error.message });

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categoryBreakdown = transactions.reduce((acc: any, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  res.json({
    totalExpenses,
    categoryBreakdown,
    transactionCount: transactions.length
  });
});

// 5. Goals
app.post("/api/create-goal", async (req, res) => {
  const { user_id, title, target_amount, current_amount, deadline } = req.body;
  const { data, error } = await supabase
    .from("goals")
    .insert([{ user_id, title, target_amount, current_amount, deadline }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/api/goals", async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/api/insights", async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// 6. Decision Simulation
app.post("/api/simulate-decision", async (req, res) => {
  const { user_id, amount, description } = req.body;

  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user_id);
  const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user_id);

  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Simulate the impact of spending ${amount} on "${description}". 
    User's current goals: ${JSON.stringify(goals)}. 
    Recent transactions: ${JSON.stringify(transactions?.slice(0, 10))}. 
    Provide: impact on savings, delay in goals, and a recommendation. 
    Return JSON with keys: impact, delay, recommendation.`,
    config: { responseMimeType: "application/json" }
  });

  const response = await model;
  res.json(JSON.parse(response.text));
});

// --- Helper Functions ---

function categorizeMerchant(merchant: string): string {
  const m = merchant.toLowerCase();
  if (m.includes("swiggy") || m.includes("zomato") || m.includes("restaurant")) return "Food";
  if (m.includes("uber") || m.includes("ola") || m.includes("petrol")) return "Travel";
  if (m.includes("amazon") || m.includes("flipkart")) return "Shopping";
  if (m.includes("electricity") || m.includes("water") || m.includes("rent")) return "Bills";
  return "Others";
}

async function generateInsights(user_id: string) {
  const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", user_id);
  if (!transactions) return;

  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these transactions: ${JSON.stringify(transactions)}. 
    Generate 3 financial insights. 
    Rules: If food > 30% total, warn. If savings decreased, alert. If subscriptions found, suggest reduction. 
    Return a JSON array of objects with: message, type (warning/suggestion), priority (low/medium/high), impact_value, confidence_score.`,
    config: { responseMimeType: "application/json" }
  });

  const response = await model;
  const insights = JSON.parse(response.text);

  await supabase.from("insights").insert(insights.map((i: any) => ({ ...i, user_id })));
}

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

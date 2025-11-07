import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import OpenAI from "openai";

dotenv.config();
const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use(bodyParser.json());

// ✅ Stripe Checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;
    const priceId =
      plan === "annual"
        ? "price_1SQJkp2kAcColjtDFvfkiQ9m"
        : "price_1SQJje2kAcColjtDDfO7cVJY";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://vetchat.net/success",
      cancel_url: "https://vetchat.net/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err.message);
    res.status(500).json({ error: "Stripe session creation failed." });
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ VetChat backend is live and ready!");
});

// ✅ Chat route (works for GET & POST)
app.all("/chat", async (req, res) => {
  try {
    if (req.method === "GET") {
      return res.status(400).json({ error: "Message is required" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const PORT = process.env.PORT || 10000;
// ✅ Stripe Health Check Route
app.get("/stripe-health", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ status: "ok", connected: true, message: "Stripe key is valid ✅", balance });
  } catch (err) {
    console.error("Stripe health check failed:", err.message);
    res.status(500).json({ status: "error", connected: false, message: err.message });
  }
});
app.listen(PORT, () => console.log(`✅ VetChat backend running on port ${PORT}`));



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import OpenAI from "openai";

dotenv.config();
const app = express();

// ✅ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(
  cors({
    origin: ["https://vetchat.net", "https://vetchat-backend-1.onrender.com"
At line:1 char:1
+ Invoke-RestMethod -Uri "https://vetchat-backend-1.onrender.com/create ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-RestMethod], WebE
   xception
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeRestMethodCommand", "*"],
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use(bodyParser.json());

// ✅ Stripe Checkout Route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;
    const priceId =
      plan === "annual"
        ? "price_1SQJkp2kAcColjtDFvfkiQ9m" // VetChat Hero (Annual)
        : "price_1SQJje2kAcColjtDDfO7cVJY"; // VetChat Soldier (Monthly)

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

// ✅ Main Chat Route
app.post("/chat", async (req, res) => {
  try {
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

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ VetChat backend running on port ${PORT}`));

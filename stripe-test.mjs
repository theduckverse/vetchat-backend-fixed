import Stripe from "stripe";

const stripe = new Stripe("sk_live_PXeBTwge64vpaCdPycMD0QiD");

const run = async () => {
  try {
    const products = await stripe.products.list();
    console.log("✅ Connected to Stripe successfully!");
    console.log(products);
  } catch (err) {
    console.error("❌ Stripe connection failed:", err.message);
  }
};

run();

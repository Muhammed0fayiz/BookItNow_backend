import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("heyll", req.body);
    const { amount } = req.body;
    console.log("maraynalsd");
    console.log("🚀 ~ router.post ~ amount in payment route:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      // receipt_email:"fhyvhh091@gmail.com"
    });
    console.log("🚀 ~ router.post ~ paymentIntent:", paymentIntent);

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the payment intent" });
  }
});

export default router;

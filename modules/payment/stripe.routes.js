// Load environment variables
require("dotenv").config();

// Import Stripe SDK
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const Subscription = require("./stripe.model"); // Assuming you have a subscription model

router.post("/create-customer", async (req, res) => {
  const { email, paymentMethodId } = req.body;
  

  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return res.status(200).json({ customerId: customer.id });
  } catch (err) {
    console.error("Error creating customer:", err.message);
    return res.status(500).json({ error: "Failed to create customer" });
  }
});

router.post("/create-subscription", async (req, res) => {
  const { customerId, priceId } = req.body;
  console.log(customerId, priceId);

  try {
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription details in MongoDB
    const newSubscription = new Subscription({
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    await newSubscription.save();

    res.status(200).json({ subscriptionId: subscription.id });
  } catch (err) {
    //   console.error('Error creating subscription:', err.message);
    //   res.status(500).json({ error: 'Failed to create subscription' });
    throw err;
  }
});


router.get('/get-price', async (req, res) => {
  try {
    // Replace with your actual priceId from Stripe
    const priceId = 'price_1QcO7yLEvlBZD5dJQFVPekKR';
    return res.status(200).json({ priceId });
  } catch (err) {
    console.error("Error fetching price:", err);
    return res.status(500).json({ error: "Failed to fetch price" });
  }
});

// Create PaymentIntent for client-side confirmation
router.post('/create-payment-intent', async (req, res) => {
  const { priceId } = req.body;

  try {
    // You can create a PaymentIntent using the priceId for the product or plan
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // The price in cents, adjust based on your price
      currency: 'usd', // You can change this currency based on your requirement
      description: 'Premium Subscription',  // A description for the payment
      payment_method_types: ['card'], // Allowing card payments
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});






router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
  
      // Update subscription in MongoDB
      Subscription.findOneAndUpdate(
        { subscriptionId: subscription.id },
        { status: subscription.status },
        (err, doc) => {
          if (err) console.error(err);
          else console.log('Subscription updated:', doc);
        }
      );
    }
  
    res.status(200).send('Received');
  });
  

module.exports = router;

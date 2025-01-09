// Load environment variables
require("dotenv").config();

// Import Stripe SDK
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const Subscription = require("./stripe.model"); // Assuming you have a subscription model
const socketIo = require('socket.io');
const app = require("../../app");
const { createCustomer, createSubscription, getPrice, createPaymentInted, getPlan, cancelSubscription } = require("./strip.controller");
const httpServer = require('http').Server(app); // Wrap the app with an HTTP server
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

router.post("/create-customer/:userId", createCustomer);

router.post("/create-subscription/:userId", createSubscription);


router.get('/get-price', getPrice);

// Create PaymentIntent for client-side confirmation
router.post('/create-payment-intent', createPaymentInted);


router.get('/get-plans', getPlan);

router.delete("/cancelSubscription/:userId", cancelSubscription);




// router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
//     const sig = req.headers['stripe-signature'];
  
//     let event;
  
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error(`Webhook Error: ${err.message}`);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     // Handle the event
//     if (event.type === 'customer.subscription.updated') {
//       const subscription = event.data.object;
  
//       // Update subscription in MongoDB
//       Subscription.findOneAndUpdate(
//         { subscriptionId: subscription.id },
//         { status: subscription.status },
//         (err, doc) => {
//           if (err) console.error(err);
//           else console.log('Subscription updated:', doc);
//         }
//       );
//     }
  
//     res.status(200).send('Received');
//   });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  console.log("lalalalalalalqalala")

  let event;

  try {
    // Verify the Stripe webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Event data:', JSON.stringify(event.data, null, 2));
    // Handle the subscription updated event
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;

      // Update subscription in MongoDB (or any other storage)
      Subscription.findOneAndUpdate(
        { subscriptionId: subscription.id },
        { status: subscription.status, priceId: subscription.items.data[0].price.id },
        (err, doc) => {
          if (err) {
            console.error('Error updating subscription:', err);
          } else {
            // Emit the updated subscription status to frontend clients via WebSocket
            io.emit('subscriptionUpdated', {
              subscriptionId: subscription.id,
              status: subscription.status
            });
          }
        }
      );
    }

    res.status(200).send('Received');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
module.exports = router;

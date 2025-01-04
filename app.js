const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require('body-parser');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const route = require("./modules/users/users.routes");
const beatRoute = require("./modules/beat/beat.route");
const stripeRoute = require("./modules/payment/stripe.routes");
const UserDashboard = require("./modules/userDashboard/userDashboard.route");
const User = require("./modules/users/users.models");
ExtraCredit = require("./modules/creditpayment/creditpayment.route");
const stripe = require("stripe")(
  "sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK"
);

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://10.0.2.2:8081'], 
  credentials: true, 
}));

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  session({
    secret: "changeit",
    resave: true, 
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);

// Middleware to conditionally use express.json()
app.use((req, res, next) => {
  if (req.path === '/webhook') {
    next(); // Skip express.json() for the /webhook route
  } else {
    express.json()(req, res, next); // Use express.json() for other routes
  }
});

app.use("/api/users", route);
app.use("/api/beat", beatRoute);
app.use("/api/payments", stripeRoute);
app.use("/api/credit", ExtraCredit);
app.use("/api/dashboard", UserDashboard);

app.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    if (!sessionId) {
      return res.status(400).send({ message: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).send({ message: 'Session not found' });
    }

    res.status(200).send({ message: 'Payment successful', session });
  } catch (error) {
    console.error('Error retrieving session:', error.message);
    res.status(500).send({ message: `500! Something broken: ${error.message}` });
  }
});



// app.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error(`Webhook signature verification failed: ${err.message}`);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object;
//         console.log('PaymentIntent was successful!');
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     res.json({ received: true });
//   }
// );
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = "whsec_vv9rWBsQbtE13jyTvpziJdKRHQGrZz1O";

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  // Handle successful payment
  console.log('Event type:', event.type);
  if (event.type === 'checkout.session.completed') {
    console.log('Checkout session completed!');
    const session = event.data.object;

    // Find user and update credits
    const userId = session.metadata.userId; // Pass metadata in checkout session
    const user = await User.findById(userId);
    console.log('User:', user);

    if (user) {
      user.credit += 10; // Add 10 credits
      await user.save();
    }
  }

  res.status(200).send();
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "500! Something broken",
  });
});

module.exports = app;

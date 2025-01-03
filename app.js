const express = require("express");
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
app.use(express.json());
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


app.use("api/users", route);
app.use("/api/beat", beatRoute)
app.use("/api/payments", stripeRoute)
app.use("/api/credit", ExtraCredit)
app.use("/api/dashboard", UserDashboard)

app.get('/success',async (req, res) => {
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

    // Handle the success logic (e.g., updating user data)
    console.log('Session details:', session);

    res.status(200).send({ message: 'Payment successful', session });
  } catch (error) {
    console.error('Error retrieving session:', error.message);
    res.status(500).send({ message: `500! Something broken: ${error.message}` });
  }
} )


  
  // Use body-parser to capture raw body for Stripe signature verification




  // Use raw body for Stripe webhook signature verification
app.use(
  '/webhook',
  bodyParser.raw({ type: 'application/json' })
);

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'we_1Qd7uHLEvlBZD5dJMXIkuetm';
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    // Add more event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
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

//hello

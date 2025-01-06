const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const route = require("./modules/users/users.routes");
const beatRoute = require("./modules/beat/beat.route");
const stripeRoute = require("./modules/payment/stripe.routes");
const UserDashboard = require("./modules/userDashboard/userDashboard.route");
const User = require("./modules/users/users.models");
ExtraCredit = require("./modules/creditpayment/creditpayment.route");
AdminRouter = require("./modules/adminDashboard/adminDashboard.route");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(
  "sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK"
);
const Transection = require("./modules/TotalCalculation/calculation.model")
const path = require("path");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://10.0.2.2:8081",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.use((req, res, next) => {
  //  || req.path === '/api/payments/webhook'
  if (req.path === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/users", route);
app.use("/api/beat", beatRoute);
app.use("/api/payments", stripeRoute);
app.use("/api/credit", ExtraCredit);
app.use("/api/dashboard", UserDashboard);
app.use("/api/admin" , AdminRouter)

app.get("/success", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    if (!sessionId) {
      return res.status(400).send({ message: "Session ID is required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).send({ message: "Session not found" });
    }

    res.status(200).send({ message: "Payment successful", session });
  } catch (error) {
    console.error("Error retrieving session:", error.message);
    res
      .status(500)
      .send({ message: `500! Something broken: ${error.message}` });
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const endpointSecret = "whsec_vv9rWBsQbtE13jyTvpziJdKRHQGrZz1O";

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        endpointSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.sendStatus(400);
    }

    // Handle successful payment
    //console.log('Event type:', event.type);
    if (event.type === "checkout.session.completed") {
      console.log("Checkout session completed!");
      const session = event.data.object;

      const userId = session.metadata.userId;
      const user = await User.findById(userId);
      console.log("User:", user);

      if (user) {
        user.credit += 10;
        const newTransaction = new Transection({
          credit: 10, 
          userId: user._id,
          customerId: user.customerId, 
        });
        await newTransaction.save();
        await user.save();

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.node_mailer_user,
            pass: process.env.NODE_MAILER_PASSWORD,
          },
        });

        const mailOptions = {
          from: '"LuiZ Music" <your-smtp-email@example.com>',
          to: user.email, // User's email
          subject: "Credits Added to Your Account",
          text: `Hi ${user.name},\n\nYou have been awarded 10 additional credits! Your new credit balance is ${user.credit}.\n\nThank you for using our service!\n\nBest regards,\nYour App Team`,
          html: `<p>Hi ${user.name},</p>
               <p>You have been awarded <strong>10 additional credits</strong>! Your new credit balance is <strong>${user.credit}</strong>.</p>
               <p>Thank you for using our service!</p>
               <p>Best regards,<br>Your App Team</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      }
    }

    res.status(200).send();
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "500! Something broken",
  });
});

module.exports = app;

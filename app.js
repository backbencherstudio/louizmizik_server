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
const ExtraCredit = require("./modules/creditpayment/creditpayment.route");
const AdminRouter = require("./modules/adminDashboard/adminDashboard.route");
const nodemailer = require("nodemailer");
const Subscription = require("./modules/payment/stripe.model");
const Transection = require("./modules/TotalCalculation/calculation.model");
const support = require("./modules/supports/support.route");
const testApiRoute = require("./modules/test3rdApi/testApi.route");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
  if (req.path === "/webhook" || req.path === "/api/payments/webhook") {
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
app.use("/api/admin", AdminRouter);
app.use("/api/support", support);
// optional----------------------
app.use("/api/safeApi", testApiRoute);

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
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_EXTRA_CREDIT;
    //console.log("ohohohohohoh");
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
          userNAme: user.name,
          userEmail: user.email,
          customerId: user.customerId,
          method: "extracredit",
          amount: 5,
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
          text: `Hi ${user.name},\n\nYou have been awarded 10 additional credits! Your new credit balance is ${user.credit}.\n\nThank you for using our service!\n\nBest regards,\nLuiz Music`,
          html: `<p>Hi ${user.name},</p>
               <p>You have been awarded <strong>10 additional credits</strong>! Your new credit balance is <strong>${user.credit}</strong>.</p>
               <p>Thank you for using our service!</p>
               <p>Best regards,<br>Luiz Music Team</p>`,
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

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      //console.log("aitaaa", invoice);
      const subscriptionId = invoice.subscription;
      const userId = invoice?.subscription_details?.metadata?.userId;
      const customerId = invoice?.subscription_details?.metadata?.customerId;

      // stripe.subscriptions
      //   .retrieve(subscriptionId)
      //   .then((subscription) => {
      //      userId = subscription.metadata.userId;
      //      customerId = subscription.metadata.customerId;
      //   })
      //   .catch((err) => {
      //     console.error("Failed to retrieve subscription:", err);
      //   });

      // async function handleSubscription(subscriptionId) {
      //   try {
      //     // Fetch the subscription to get metadata
      //     const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      //     userId = subscription.metadata.userId;
      //     customerId = subscription.metadata.customerId;

      //     if (!userId) {
      //       throw new Error("User ID is missing in subscription metadata");
      //     }

      //     // Save subscription details in MongoDB
      //     // const user = await User.findById(userId);

      //     // if (!user) {
      //     //   throw new Error(`User not found for ID: ${userId}`);
      //     // }

      //     // Add logic to save or process subscription details here
      //     console.log("Subscription details saved successfully.");
      //   } catch (err) {
      //     console.error("Error handling subscription:", err);
      //   }
      // }

      // // Example call
      // handleSubscription(subscriptionId);

      // ---------------------------
      // Save subscription details in MongoDB
      const user = await User.findById(userId);
      console.log("user", user);
      const newSubscription = new Subscription({
        customerId,
        userId: user._id,
        userNAme: user.name,
        userEmail: user.email,
        subscriptionId: subscriptionId,
        status: "active",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      });

      await newSubscription.save();

      //console.log(user);
      if (user) {
        user.credit = (user.credit || 0) + 20;
        user.active = true;

        const newTransaction = new Transection({
          credit: 20,
          userId: user._id,
          customerId: customerId,
          method: "subscription",
          amount: 9.99,
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
          from: '"Luiz Music" <your_email@example.com>', // Sender address
          to: user.email, // User's email address
          subject: "New Subscription Added",
          text: `Hi ${user.name},\n\nA new subscription has been added to your account. Your current credit balance is now ${user.credit}.\n\nThank you for choosing our service!\n\nBest regards,\nYour Company Name`,
          html: `<p>Hi ${user.name},</p>
               <p>A new subscription has been added to your account. Your current credit balance is now <strong>${user.credit}</strong>.</p>
               <p>Thank you for choosing our service!</p>
               <p>Best regards,<br>Luiz Music</p>`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("Email sent successfully!");
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
      // ----------------------------------------------------end----------------------------
    }

    // if (event.type === "customer.subscription.deleted") {
    //   console.log(
    //     "deleleteteteteteteteteteteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeddfdd"
    //   );
    //   const Onesubscription = event.data.object;
    //   const customerId = Onesubscription.metadata.customerId;

    //   const subscription = await Subscription.findOne({
    //     customerId: customerId,
    //   });
    //   if (!subscription) {
    //     return res.status(404).json({ message: "Subscription not found" });
    //   }

    //   subscription.status = "canceled";
    //   subscription.endDate = new Date();
    //   await subscription.save();
    // }
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

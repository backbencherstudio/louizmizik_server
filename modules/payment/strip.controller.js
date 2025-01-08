require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const Subscription = require("./stripe.model");
const User = require("../users/users.models");
const Transection = require("../TotalCalculation/calculation.model");
const nodemailer = require("nodemailer");


exports.createCustomer = async (req, res) => {
  const { email, paymentMethodId } = req.body;
  const { userId } = req.params;
  const user = await User.findById(userId);
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  if (user && user.customerId != null) {
    console.log("User already has a customer ID:", user.customerId);
    return res.status(200).json({ customerId: user.customerId });
  } else {
    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      user.customerId = customer.id;
      await user.save();
      return res.status(200).json({ customerId: customer.id });
    } catch (err) {
      console.error("Error creating customer:", err.message);
      return res.status(500).json({ error: "Failed to create customer" });
    }
  }
};







exports.createSubscription = async (req, res) => {
  const { customerId, priceId } = req.body;
  //console.log(customerId, priceId);

  const subscriber = await Subscription.findOne({ customerId: customerId });
  if (subscriber) {
    if (Date.now() <= new Date(subscriber.endDate).getTime()) {
      return res
        .status(400)
        .json({ message: "Your Preveous Subscription time not finished!!!!!" });
    }
  }

  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription details in MongoDB
    const newSubscription = new Subscription({
      customerId,
      userId : user._id,
      subscriptionId: subscription.id,
      status: subscription.status,
      startDate: new Date(), 
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)), 
    });

    await newSubscription.save();
    

    //console.log(user);
    if (user) {
      user.credit = (user.credit || 0) + 20;

      const newTransaction = new Transection({
        credit: 20, 
        userId: user._id,
        customerId: customerId, 
        method: "subscription",
        amount : 10
        
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
        subject: 'New Subscription Added',
        text: `Hi ${user.name},\n\nA new subscription has been added to your account. Your current credit balance is now ${user.credit}.\n\nThank you for choosing our service!\n\nBest regards,\nYour Company Name`,
        html: `<p>Hi ${user.name},</p>
               <p>A new subscription has been added to your account. Your current credit balance is now <strong>${user.credit}</strong>.</p>
               <p>Thank you for choosing our service!</p>
               <p>Best regards,<br>Your Company Name</p>`,
      };
    
      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
      } catch (error) {
        console.error('Error sending email:', error);
      }

    }

    return res.status(200).json({ subscriptionId: subscription.id });
  } catch (err) {
    //throw err;
    console.error("Error creating subscription:", err.message);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
};





exports.getPrice = async (req, res) => {
  try {
    // Replace with your actual priceId from Stripe
    const priceId = process.env.STRIPE_SUBSCRIPTION_KEY;
    return res.status(200).json({ priceId });
  } catch (err) {
    console.error("Error fetching price:", err);
    return res.status(500).json({ error: "Failed to fetch price" });
  }
};





exports.createPaymentInted = async (req, res) => {
  const { priceId } = req.body;

  try {
    // You can create a PaymentIntent using the priceId for the product or plan
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // The price in cents, adjust based on your price
      currency: "usd", // You can change this currency based on your requirement
      description: "Premium Subscription", // A description for the payment
      payment_method_types: ["card"], // Allowing card payments
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
};





exports.getPlan = async (req, res) => {
  try {
    const productId = "prod_RVOv4hXMeszfqN"; // Replace with your actual product ID

    // Fetch all prices associated with the product
    const prices = await stripe.prices.list({
      product: productId, // Filtering prices by product
    });

    // Format the plans to return the relevant details
    const plans = prices.data.map((price) => ({
      id: price.id,
      name:
        price.nickname ||
        `Plan for ${price.unit_amount / 100} ${price.currency.toUpperCase()}`, // Dynamic name (you can customize this)
      priceId: price.id,
      amount: price.unit_amount, // Price in cents
      currency: price.currency,
    }));

    res.status(200).json({ plans });
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};



exports.cancelSubscription = async (req, res) => {
  const userId = req.params.userId;

  try {
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Find the subscription
      const subscription = await Subscription.findOne({ customerId: user.customerId });
      if (!subscription) {
          return res.status(404).json({ message: 'Subscription not found' });
      }

      // Cancel the subscription in Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(subscription.subscriptionId);


      // Update subscription status in MongoDB
      subscription.status = 'canceled';
      subscription.endDate = new Date();
      await subscription.save();

      // Respond with success
      return res.status(200).json({
          message: 'Subscription canceled successfully',
          subscription: canceledSubscription,
      });
  } catch (error) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
  }
};

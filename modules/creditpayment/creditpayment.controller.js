require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../users/users.models");

exports.extraCredit = async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters
  console.log(userId);

  try {
    // Find the user using the correct method
    const user = await User.findById(userId); 

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1Qd1SyLEvlBZD5dJL1IkyYzV", // Replace with your actual price ID
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: user._id.toString(), // Pass the user ID as metadata
      },
      success_url: "https://ed5d-103-161-9-102.ngrok-free.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://ed5d-103-161-9-102.ngrok-free.app",
    });

    // Send the session URL to the client
    res.json({ url: session.url });
  } catch (error) {
    // Log the error and send an appropriate response
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};



// exports.getSuccess = async (req, res) => {
//     const sessionId = req.query.session_id;
  
//     try {
//       if (!sessionId) {
//         return res.status(400).send({ message: 'Session ID is required' });
//       }
  
//       // Retrieve the session from Stripe
//       const session = await stripe.checkout.sessions.retrieve(sessionId);
  
//       if (!session) {
//         return res.status(404).send({ message: 'Session not found' });
//       }
  
//       // Handle the success logic (e.g., updating user data)
//       console.log('Session details:', session);
  
//       res.status(200).send({ message: 'Payment successful', session });
//     } catch (error) {
//       console.error('Error retrieving session:', error.message);
//       res.status(500).send({ message: `500! Something broken: ${error.message}` });
//     }
//   };

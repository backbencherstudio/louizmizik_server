require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../users/users.models");

exports.extraCredit = async (req, res) => {
  const { userId } = req.params; 
  console.log(userId);

  try {
    const user = await User.findById(userId); 

    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_ADD_CREDIT_KEY, 
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: user._id.toString(), 
      },
      success_url: "https://ed5d-103-161-9-102.ngrok-free.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://ed5d-103-161-9-102.ngrok-free.app",
    });

    res.json({ url: session.url });
  } catch (error) {
  
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};




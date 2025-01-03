const stripe = require("stripe")(
  "sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK"
);
const User = require("../users/users.models");

exports.extraCredit = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = User.findOne(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1Qd1SyLEvlBZD5dJL1IkyYzV",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
      
        "https://cfae-103-161-9-102.ngrok-free.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://cfae-103-161-9-102.ngrok-free.app",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    throw error;
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.getSuccess = async (req, res) => {
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
  };

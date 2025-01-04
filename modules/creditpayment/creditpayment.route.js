
const express = require('express');
const router = express.Router();

const { extraCredit, getSuccess } = require('./creditpayment.controller');
const User = require("../users/users.models");

router.post('/purchase-credits/:userId', extraCredit);
// router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//     const endpointSecret = 'sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK';
  
//     let event;
  
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         req.headers['stripe-signature'],
//         endpointSecret
//       );
//     } catch (err) {
//       console.error('Webhook signature verification failed:', err.message);
//       return res.sendStatus(400);
//     }
  
//     // Handle successful payment
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
  
//       // Find user and update credits
//       const userId = session.metadata.userId; // Pass metadata in checkout session
//       const user = await User.findById(userId);
  
//       if (user) {
//         user.credits += 10; // Add 10 credits
//         await user.save();
//       }
//     }
  
//     res.status(200).send();
//   });
  


module.exports = router;

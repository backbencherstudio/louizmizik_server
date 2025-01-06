
const User = require("../users/users.models")
const Beat = require("../beat/beat.model")
const Transection = require("../TotalCalculation/calculation.model")
const Subscription = require("../payment/stripe.model")



exports.adminDashboard = async (req, res) =>{
    const User = require("../models/User"); 

    try {
       
        const totalUsers = await User.countDocuments();
        const totalRegisteredBeats = await Beat.countDocuments({ register: true });
        const result = await Transection.aggregate([
            {
              $group: {
                _id: null, // Group all documents together
                totalCredit: { $sum: "$credit" },
              },
            },
          ]);
          const totalCredit = result.length > 0 ? result[0].totalCredit : 0;
          const data  = {
            totalUsers,
            totalRegisteredBeats,
            totalCredit
          }
      
          res.status(200).json({
            success: true,
            data,
          });
        
        
      } catch (error) {
        
        
      }
    };
    
    
    


exports.addUserBlacklist = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const subscription = await Subscription.findOne({customerId : user.customerId});
        user.blacklist = true;
        user.subscriptionEndDAte =  subscription.endDate;


        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'User added to blacklist successfully' });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



exports.allUserDetails = async (req,res) =>{
  try {
    
    const users = await User.find({}, '-password -newpassword -confirmPassword');

    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({ customerId: user.customerId });
        return {
          ...user._doc, // Spread user document
          subscriptionStatus: subscription ? subscription.status : null,
          subscriptionId: subscription ? subscription.subscriptionId : null,
        };
      })
    );

    res.status(200).json(usersWithSubscriptions);
  } catch (error) {
    console.error('Error fetching users with subscriptions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}

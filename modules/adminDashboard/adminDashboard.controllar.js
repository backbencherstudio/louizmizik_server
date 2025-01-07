
const User = require("../users/users.models")
const Beat = require("../beat/beat.model")
const Transection = require("../TotalCalculation/calculation.model")
const Subscription = require("../payment/stripe.model")



exports.adminDashboard = async (req, res) =>{
    try {
       
        const totalUsers = await User.countDocuments();
        const totalRegisteredBeats = await Beat.countDocuments({ register: true });
        const result = await Transection.aggregate([
            {
              $group: {
                _id: null, 
                totalCredit: { $sum: "$credit" },
              },
            },
          ]);
          const totalCredit = result.length > 0 ? result[0].totalCredit : 0;

          const revenueResult = await Transection.aggregate([
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
              },
            },
          ]);
          const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;



          const transection = await Transection.aggregate([
            {
              $match: { method: "extracredit" },
            },
            {
              $group: {
                _id: null, 
                totalExtraCredit: { $sum: "$credit" }, 
              },
            },
          ]);
      
         
          const totalExtraCredit = transection[0]?.totalExtraCredit || 0;


          const data  = {
            totalUsers,
            totalRegisteredBeats,
            totalCredit,
            totalRevenue,
            totalExtraCredit
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


exports.getUserRegistrationsByTimeframe = async (req, res) => {
  try {
    const { timeframe } = req.query;
    const { lastDay, lastWeek, lastMonth, startOfMonth, last90Days, startOfYear } = calculateDateRanges();

    let startDate;

    switch (timeframe) {
      case "lastDay":
        startDate = lastDay;
        break;
      case "lastWeek":
        startDate = lastWeek;
        break;
      case "lastMonth":
        startDate = lastMonth;
        break;
      case "monthToDate":
        startDate = startOfMonth;
        break;
      case "last90Days":
        startDate = last90Days;
        break;
      case "yearToDate":
        startDate = startOfYear;
        break;
      default:
        return res.status(400).json({ message: "Invalid timeframe specified." });
    }

    const users = await User.find({ createdAt: { $gte: startDate } });

    res.status(200).json({
      timeframe,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user registrations" });
  }
};



// Utility function to calculate date ranges
const calculateDateRanges = () => {
  const now = new Date();

  return {
    lastDay: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    lastWeek: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    lastMonth: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    last90Days: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90),
    startOfYear: new Date(now.getFullYear(), 0, 1),
  };
};

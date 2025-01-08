const User = require("../users/users.models");
const Beat = require("../beat/beat.model");
const Transection = require("../TotalCalculation/calculation.model");
const Subscription = require("../payment/stripe.model");

exports.adminDashboard = async (req, res) => {
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
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

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

    const Subscriptiontransection = await Transection.aggregate([
      {
        $match: { method: "subscription" },
      },
      {
        $group: {
          _id: null,
          totalSubscripnCredit: { $sum: "$credit" },
        },
      },
    ]);

    const totalSubscriptionCredit =
      Subscriptiontransection[0]?.totalSubscripnCredit || 0;
    const AvrgBeatRegistration = totalRegisteredBeats / totalUsers;
    const totalActiveUsers = await Subscription.countDocuments({
      status: "active",
    });
    const totalInactiveUsers = await Subscription.countDocuments({
      status: "canceled",
    });

    const data = {
      totalUsers,
      totalActiveUsers,
      totalInactiveUsers,
      totalRegisteredBeats,
      totalCredit,
      totalRevenue,
      totalSubscriptionCredit,
      totalExtraCredit,
      AvrgBeatRegistration,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {}
};

exports.addUserBlacklist = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subscription = await Subscription.findOne({
      customerId: user.customerId,
    });
    user.blacklist = true;
    user.subscriptionEndDAte = subscription.endDate;

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ message: "User added to blacklist successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.allUserDetails = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "-password -newpassword -confirmPassword"
    );

    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({
          customerId: user.customerId,
        });
        return {
          ...user._doc, // Spread user document
          subscriptionStatus: subscription ? subscription.status : null,
          subscriptionId: subscription ? subscription.subscriptionId : null,
        };
      })
    );

    res.status(200).json(usersWithSubscriptions);
  } catch (error) {
    console.error("Error fetching users with subscriptions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUserRegistrationsByTimeframe = async (req, res) => {
  try {
    const { timeframe } = req.query;
    const {
      lastDay,
      lastWeek,
      lastMonth,
      startOfMonth,
      last90Days,
      startOfYear,
    } = calculateDateRanges();

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
        return res
          .status(400)
          .json({ message: "Invalid timeframe specified." });
    }

    // const users = await User.find({ createdAt: { $gte: startDate } });
    const users = await User.find({ createdAt: { $gte: startDate } }).select(
      "-password -newpassword -confirmPassword"
    );

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

// revenue Dashboard---------------------------------------------------------
exports.revenueDashboard = async (req, res) => {
  try {
    const { filter } = req.query; // e.g., "day", "week", "month", "year", etc.

    const { startDate, endDate } = getDateRange(filter);

    const revenueData = await calculateRevenue({ startDate, endDate });

    // Send the response
    return res.status(200).json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating revenue.",
    });
  }
};

// Function to calculate total revenue and breakdown
async function calculateRevenue({ startDate, endDate }) {
  const matchStage = {};

  // Apply date filters if provided
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const pipeline = [
    { $match: matchStage }, // Filter by date range
    {
      $group: {
        _id: "$method", // Group by method (subscription, extracredit, etc.)
        totalAmount: { $sum: "$amount" }, // Sum of amounts per method
      },
    },
    {
      $group: {
        _id: null, // Overall totals
        breakdown: { $push: { method: "$_id", totalAmount: "$totalAmount" } },
        totalRevenue: { $sum: "$totalAmount" }, // Sum all amounts for total revenue
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id from final output
        breakdown: 1,
        totalRevenue: 1,
      },
    },
  ];

  const result = await Transection.aggregate(pipeline);
  return result.length > 0 ? result[0] : { breakdown: [], totalRevenue: 0 };
}

// Helper function to generate date ranges
function getDateRange(filter) {
  const now = new Date();
  let startDate, endDate;

  switch (filter) {
    case "day":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      const startOfWeek = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(startOfWeek));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    case "last90days":
      startDate = new Date(now.setDate(now.getDate() - 90));
      endDate = new Date();
      break;
    case "ytd":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date();
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
}

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

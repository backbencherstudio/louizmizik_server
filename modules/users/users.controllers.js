require("dotenv").config();
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { sign, verify } = require("jsonwebtoken");

const User = require("./users.models");
const Transection = require("../TotalCalculation/calculation.model");
const Beat = require("../beat/beat.model");

const {
  generateOTP,
  sendUpdateEmailOTP,
  sendForgotPasswordOTP,
  sendRegistrationOTPEmail,
} = require("../../util/otpUtils");

const generateToken = (id, email, role) => {
  return sign({ userId: id, email, role }, process.env.WEBTOKEN_SECRET_KEY, {
    expiresIn: "30d",
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(8);
  return await bcrypt.hash(password, salt);
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    let user = await User.find();
    // const token = req.cookies.authToken;
    // console.log(token);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Check required fields
    if (!(name && email && password)) {
      res.status(400).json({
        message: "Please fill all required fields",
      });
      return;
    }

    name = name.replace(/\s+/g, " ").trim();

    // Validate email
    if (!isEmail(email)) {
      res.status(400).json({ message: "Please enter a valid email address" });
      return;
    }

    // Prevent email and name from being identical
    if (email === name) {
      res
        .status(400)
        .json({ message: "Email cannot be the same as your name" });
      return;
    }

    // Password validations
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be longer than 6 characters" });
      return;
    }

    if (password === name || password === email) {
      res.status(400).json({
        message: "Password cannot be the same as your name or email",
      });
      return;
    }

    // Check if user exists and hash password concurrently
    const [exUser, hashedPassword] = await Promise.all([
      User.findOne({ email }),
      hashPassword(password),
    ]);

    if (exUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Fetch the country based on IP
    let country = "Unknown"; // Default value in case location fetch fails
    try {
      const response = await fetch("http://get.geojs.io/v1/ip/geo.json");
      if (response.ok) {
        const data = await response.json();
        country = data.country || "Unknown";
      }
    } catch (error) {
      console.error("Error fetching IP-based location:", error.message);
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      country, // Ensure the fetched country is added here
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id, newUser.email, newUser.role);

    // Set token in cookie
    setTokenCookie(res, token);

    // Send response
    res.status(201).json({ token, user: newUser, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { userData } = req.session;

    if (!userData?.email || !userData?.name) {
      res.status(400).json({ message: "User data not found in session" });
      return;
    }

    const OTP = generateOTP();
    req.session.otp = OTP;

    // Send OTP email in the background (non-blocking)
    sendRegistrationOTPEmail(userData.name, userData.email, OTP)
      .then(() => console.log("OTP email sent"))
      .catch((err) => console.error("Error sending OTP email:", err));

    // Respond immediately without waiting for email to be sent
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    console.log(122, req.body);
    const { otp } = req.body;
    console.log(otp);

    if (
      !req.session.userData ||
      !req.session.userData.name ||
      !req.session.userData.email ||
      !req.session.userData.password
    ) {
      res.status(400).json({
        message: "Registration incomplete",
      });
      return;
    }

    console.log("req.session.otp", req.session.otp);

    if (otp != req.session.otp) {
      res.status(400).json({
        message: "Invalid OTP",
      });
      return;
    }

    // Create new User and generate JWT token in parallel
    const newUser = new User(req.session.userData);

    // Generate JWT and save the user simultaneously
    const [savedUser, token] = await Promise.all([
      newUser.save(), // Save the new user to the database
      sign(
        { userEmail: newUser.email, userId: newUser._id },
        process.env.WEBTOKEN_SECRET_KEY,
        { expiresIn: "1d" }
      ),
    ]);

    // Clear session data after successful save
    delete req.session.userData;
    delete req.session.otp;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ token, user: savedUser, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate user
const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    var country;

    if (!email || !password) {
      res.status(400).json({ message: "Please fill all required fields" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User not found!" });
      return;
    }
    if (user.blacklist && new Date() > new Date(user.subscriptionEndDAte)) {
      res.status(400).json({ message: "You are in blacklist!!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = sign(
      { userEmail: user.email, userId: user._id },
      process.env.WEBTOKEN_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Edit user profile
const editUserProfile = async (req, res) => {
  try {
    console.log(req.body);
    const imageUrl = `${req.file.filename}`;
    if (imageUrl) {
      req.body.avatar = imageUrl;
    }
    if (!req.params.userId) {
      return res.status(400).json({ message: "Unauthorized user" });
    }
    if (req.body.newpassword) {
      if (req.body.newpassword === req.body.confirmPassword) {
        res.status(400).json({ message: "Password not matched" });
        return;
      }
      req.body.password = await hashPassword(req.body.password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("lalalalaala");
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// Forgot password OTP send
const forgotPasswordOTPsend = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        message: `User not found`,
      });
      return;
    }
    const otp = generateOTP();

    req.session.otp = otp.toString();
    req.session.email = user.email;

    if (user.name) await sendForgotPasswordOTP(user.name, user.email, otp);

    res
      .status(200)
      .json({ message: "OTP sent successfully for password change" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Match forgot password OTP
const matchForgotPasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      res.status(400).json({
        message: `OTP is required`,
      });
      return;
    }

    if (otp !== req.session.otp || otp === undefined) {
      res.status(400).json({
        message: `OTP does not match`,
      });
      return;
    }

    req.session.isOtpValid = true;

    res.status(200).json({
      success: true,
      message: "OTP matched successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Reset password
const resetPasssword = async (req, res) => {
  try {
    if (!req.session.isOtpValid) {
      res.status(400).json({ message: "OTP invalid" });
      return;
    }
    const { password } = req.body;

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await User.findOneAndUpdate(
      { email: req.session.email },
      { password: hashedPassword }
    );

    // Clear session after password reset
    req.session.destroy();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const checkAuthStatus = async (req, res) => {
  const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY;

  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(400).json({ authenticated: false });
      return;
    }

    verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid token", authenticated: false });
      }

      const userId = decoded.userId;

      const userInfo = await User.findById(userId);
      if (!userInfo) {
        return res
          .status(404)
          .json({ message: "User not found", authenticated: false });
      }

      return res.status(200).json({ authenticated: true, user: userInfo });
    });
  } catch (error) {
    console.error("Error in checkAuthStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const userAlltotalCredit = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const result = await Transection.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$userId",
          totalCredit: { $sum: "$credit" },
          extraCreditCount: {
            $sum: { $cond: [{ $eq: ["$method", "extracredit"] }, 1, 0] },
          },
        },
      },
    ]);

    if (result.length > 0) {
      const { totalCredit, extraCreditCount } = result[0];
      return res.status(200).json({ totalCredit, extraCreditCount });
    } else {
      // Return 0 if no transactions exist for the user
      return res.status(200).json({ totalCredit: 0, extraCreditCount: 0 });
    }
  } catch (error) {
    console.error(
      "Error calculating total credit and extra credit count:",
      error
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

const allRegisterBeatandTransections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const beats = await Beat.find({ userId });

    const transactions = await Transection.find({ userId });

    if (beats.length === 0 && transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No beats or transactions found for this user" });
    }

    return res.status(200).json({
      beats,
      transactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const OneUser = async(req, res) =>{
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }


    return res.status(200).json({
      user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

}


module.exports = {
  checkAuthStatus,
  logout,
  resetPasssword,
  matchForgotPasswordOTP,
  forgotPasswordOTPsend,
  editUserProfile,
  authenticateUser,
  verifyOTP,
  resendOtp,
  registerUser,
  getAllUsers,
  userAlltotalCredit,
  allRegisterBeatandTransections,
  OneUser
};

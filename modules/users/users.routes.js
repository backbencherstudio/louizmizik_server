const {
  getAllUsers,
  checkAuthStatus,
  registerUser,
  verifyOTP,
  authenticateUser,
  editUserProfile,
  forgotPasswordOTPsend,
  resetPasssword,
  matchForgotPasswordOTP,
  resendOtp,
  logout,
  userAlltotalCredit,
  allRegisterBeatandTransections,
  OneUser,
  google,
  forgotPassword,
  resetPassword


} = require("./users.controllers");
const { verifyUser } = require("../../middleware/verifyUser");
const upload = require("../../middleware/multer.config.single");

const route = require("express").Router();

route.get("/", getAllUsers);
route.get("/check", checkAuthStatus);

route.post("/register", registerUser);
route.post("/verify-otp", verifyOTP);
route.post("/resendotp", resendOtp);






// ----------------------------------------------------------
route.post("/login", authenticateUser);
route.post('/forgot-password', forgotPassword);
route.post('/reset-password', resetPassword);
route.post("/google/login", google)
route.put("/update-profile/:userId", upload,   editUserProfile);
route.post("/logout", logout);

// Forgot passwords
route.post("/request-forgot-password-otp", verifyUser, forgotPasswordOTPsend);
route.post("/match-password-otp", verifyUser, matchForgotPasswordOTP);
route.patch("/reset-forgot-password", verifyUser, resetPasssword);

route.get("/oneUserDetails/:userId", OneUser)
route.get("/userAlltotalCredit/:userId", userAlltotalCredit)
route.get("/allRegisterBeatandTransections/:userId", allRegisterBeatandTransections)


module.exports = route;

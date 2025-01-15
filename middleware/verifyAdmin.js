const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyAdmin = async (req, res, next) => {
  const { token } = req.cookies;
  const JWT_SECRET = process.env.WEBTOKEN_SECRET_KEY;

  if (!token) {
    res.status(400).json({
      message: "Unauthorized user",
    });
    return;
  }

  try {
    // Decoding only userId from the token
    const decodedToken = verify(token, JWT_SECRET);

    req.userId = decodedToken.userId;
    console.log(decodedToken?.role);

    // check if the user is admin
    if (decodedToken.role && decodedToken.role !== "admin") {
      res.status(401).json({ message: "You are not allowed to access" });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

module.exports = { verifyAdmin };
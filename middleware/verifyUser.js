const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyUser = async (req, res, next) => {
  const { token } = req.cookies; // This should now be defined if cookies are parsed correctly
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
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

module.exports = { verifyUser };

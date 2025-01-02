const User = require("../users/users.models");
const Beat = require("../beat/beat.model");

exports.userdasboard = async (req, res) => {
  const user = User.faindOne({ id: req.userId });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const beatCount = await Beat.countDocuments({ userId: req.userId });
  const data = {
    beatCount,
    credit: user?.credit,
  };
  res.status(200).json({ data });
};

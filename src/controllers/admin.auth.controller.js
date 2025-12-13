const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email, password });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};

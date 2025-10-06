const User=require('../model/UserModel')

exports.getUser=async(req,res)=>{
    try {
    const users = await User.findAll({
      attributes: ["id", "name", "email"], // no passwords
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
}

// routes/userRoutes.js
exports.getUserById=async(req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ["id", "name", "email"],
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

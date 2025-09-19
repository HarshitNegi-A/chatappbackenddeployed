const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");

const userRoutes = require("./routes/userRoute");
const signupRoute = require("./routes/signupRoute");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoute");
const mediaRoute = require("./routes/mediaRoute");

const auth = require("./middleware/authMiddleware");
const User = require("./model/UserModel");
const Message = require("./model/MessageModel");
const sequelize = require("./db");

// ✅ Import setupSocketIO correctly
const { setupSocketIO } = require("./socket");

const server = http.createServer(app);
setupSocketIO(server);

app.use(cors());
app.use(express.json());

// Routes
app.use("/", signupRoute);
app.use("/chat", chatRoutes);
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);
app.use("/media", auth, mediaRoute);

// Sequelize associations
User.hasMany(Message);
Message.belongsTo(User);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected successfully!");
    server.listen(3000, () => console.log("Server is running on port 3000"));
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

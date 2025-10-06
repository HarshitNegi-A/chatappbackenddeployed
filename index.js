// server.js
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoute");
const signupRoute = require("./routes/signupRoute");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoute");
const mediaRoute = require("./routes/mediaRoute");

const auth = require("./middleware/authMiddleware");
const User = require("./model/UserModel");
const Message = require("./model/MessageModel");
const sequelize = require("./db");
const { setupSocketIO } = require("./socket");

require("dotenv").config();

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",                     // local frontend
  "https://jobtrackerfrontend-ten.vercel.app", // deployed frontend
];

// ✅ Apply CORS to Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error("Not allowed by CORS: " + origin),
          false
        );
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve static uploads (for Multer)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ HTTP Server
const server = http.createServer(app);

// ✅ Setup Socket.IO with proper CORS
setupSocketIO(server, allowedOrigins);

// ✅ Routes
app.use("/", signupRoute);
app.use("/chat", chatRoutes);
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);
app.use("/media", auth, mediaRoute);

// ✅ Sequelize associations
User.hasMany(Message);
Message.belongsTo(User);

// ✅ Start server after DB sync
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected successfully!");

    // Cron job (optional)
    require("./cron/archiveMessages");

    server.listen(3000, () =>
      console.log("🚀 Server running on http://localhost:3000")
    );
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const express=require('express')
const app=express()
const http=require('http')
const {Server}=require('socket.io')
const signupRoute=require('./routes/signupRoute')
const User=require('./model/UserModel')
const Message=require('./model/MessageModel')
const chatRoutes=require('./routes/chatRoutes')
const sequelize=require("./db")
const cors=require('cors')
const {initChatSocket}=require('./socket/chatSocket')
const server = http.createServer(app);   
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST"],
  },
});
app.use(cors())
app.use(express.json());
app.use('/',signupRoute)
app.use('/chat',chatRoutes);



User.hasMany(Message)
Message.belongsTo(User)

initChatSocket(io);

sequelize.sync()
.then(()=>{
    console.log("Database connected successfully!")
    server.listen(3000,()=>console.log("Server is running"))
})
.catch((err)=>{
     console.error("Unable to connect to the database:", err);
})
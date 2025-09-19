const express=require('express')
const app=express()
const http=require('http')
const userRoutes = require("./routes/userRoute");
const signupRoute=require('./routes/signupRoute')
const User=require('./model/UserModel')
const Message=require('./model/MessageModel')
const chatRoutes=require('./routes/chatRoutes')
const sequelize=require("./db")
const setupSocketIO = require("./socket");
const cors=require('cors')
const server = http.createServer(app);   
setupSocketIO(server)
app.use(cors())
app.use(express.json());
app.use('/',signupRoute)
app.use('/chat',chatRoutes);
app.use("/users", userRoutes);



User.hasMany(Message)
Message.belongsTo(User)


sequelize.sync({alter:true})
.then(()=>{
    console.log("Database connected successfully!")
    server.listen(3000,()=>console.log("Server is running"))
})
.catch((err)=>{
     console.error("Unable to connect to the database:", err);
})
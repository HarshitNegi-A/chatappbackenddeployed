const express=require('express')
const app=express()
const signupRoute=require('./routes/signupRoute')
const User=require('./model/UserModel')
const Message=require('./model/MessageModel')
const chatRoutes=require('./routes/chatRoutes')
const sequelize=require("./db")
const cors=require('cors')
app.use(cors())
app.use(express.json());
app.use('/',signupRoute)
app.use('/chat',chatRoutes);

User.hasMany(Message)
Message.belongsTo(User)

sequelize.sync()
.then(()=>{
    console.log("Database connected successfully!")
    app.listen(3000,()=>console.log("Server is running"))
})
.catch((err)=>{
     console.error("Unable to connect to the database:", err);
})
const express=require('express')
const app=express()
const signupRoute=require('./routes/signupRoute')
const sequelize=require("./db")
const cors=require('cors')
app.use(cors())
app.use(express.json());
app.use('/',signupRoute)


sequelize.sync({force:true})
.then(()=>{
    console.log("Database connected successfully!")
    app.listen(3000,()=>console.log("Server is running"))
})
.catch((err)=>{
     console.error("Unable to connect to the database:", err);
})
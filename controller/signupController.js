const jwt = require("jsonwebtoken");
const User=require('../model/UserModel')
const bcrypt=require('bcrypt')
require('dotenv').config()

exports.signup=async(req,res)=>{
    try{
        const {name,email,phno,pass}=req.body;

        const existingUser=await User.findOne({where:{email}});
        if(existingUser){
            return res.status(400).json({message:'User alrady exists with this email'})
        }

        const hashedPass=await bcrypt.hash(pass,10);

        const newUser=await User.create({
            name,
            email,
            phone:phno,
            password:hashedPass,
        })

        const token = jwt.sign({ id: newUser.id, name: user.name }, process.env.JWT_KEY)

        res.status(201).json({message:'SignUp successfull',newUser,token})

    }
    catch(err){
        console.error("Signup error:",err)
        res.status(500).json({message: "Server error during signup"})
    }
}

exports.login=async(req,res)=>{

    try{
        const {phno,pass}=req.body;
        const user=await User.findOne({where:{phone:phno}})

        if(!user){
            return res.status(404).json({message:'User not found'})
        }

        const isMatch=await bcrypt.compare(pass,user.password)
        if(!isMatch){
            return res.status(401).json({message:'Invalid credentials'})
        }

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_KEY)

        res.status(200).json({message:'Login Successfull',token})

    }
    catch(err){
        console.error("Login error:",err)
        res.status(500).json({message:'Server error during login'})
    }
    
}
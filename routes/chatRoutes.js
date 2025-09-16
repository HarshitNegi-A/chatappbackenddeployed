const express=require('express')
const router=express.Router()
const chatController=require('../controller/chatController')
const authMiddleware=require('../middleware/authMiddleware')

router.post('/send',authMiddleware,chatController.sendMessage)
router.get("/", authMiddleware,chatController.getMessages);
module.exports=router
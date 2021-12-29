const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken')


const {userSignup,userSignupDetails,userSignin,otpVerification,resetPassword,newPassword,followUser,unfollowUser} = require('../controller/auth')

router.post('/signup',userSignup)

router.post('/mobile_signup',userSignupDetails)

router.post('/otp-verify',otpVerification)

router.post('/signin',userSignin)

router.post('/reset-password', resetPassword)

router.post('/new-password',newPassword)

router.post('/follow',verifyToken,followUser)

router.post('/unfollow',verifyToken,unfollowUser)





module.exports = router
const express = require('express');
const router = express.Router();
const { userSignup, userSignupDetails, userSignin, otpVerification } = require('../controller/auth')

router.post('/signup', userSignup)

router.post('/mobile_signup', userSignupDetails)

router.post('/otp-verify', otpVerification)

router.post('/signin', userSignin)






module.exports = router
const User = require('../models/user');
const bcrypt = require('bcryptjs')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceToken = process.env.TWILIO_SERVICE_TOKEN;
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken')
const client = require('twilio')(accountSid, authToken);
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.EMAIL_TOKEN
    }
}))


exports.userSignup = async (req, res) => {
    const { mobileNumber } = req.body
    if (req.body["sign_up_by"] == "user") {
        const userData = await User.findOne({ mobileNumber })
        if (userData) {
            return res.status(401).json({ error: "Number already exists" })
        }
        client.verify.services(serviceToken)
            .verifications
            .create({ to: `+91${mobileNumber}`, channel: 'sms' })
            .then(verification => console.log(verification));
        res.status(200).json({ message: "saved successfully and otp had sent", mobileNumber })


    }
}

exports.userSignupDetails = asyncHandler(async (req, res) => {
    const { name, user_name, email, password } = req.body
    const savedUser = await User.findOne({ email })
    const savedName = await User.findOne({ user_name })
    if (!email || !password || !user_name || !name) {
        res.status(422).json({ error: " Please enter all the fields" })
    } else if (savedUser) {
        res.status(422).json({ error: "User email already exists" })
    }
    else if (savedName) {
        res.status(422).json({ error: "User name already exists" })
    } else {

        bcrypt.hash(password, 10).then(async (hashedPassword) => {
            await User.findByIdAndUpdate(req.body.userId, {
                $set: {
                    name,
                    user_name,
                    email,
                    password: hashedPassword
                }
            }, {
                new: true
            })
                .exec((err, result) => {
                    console.log("result", result)
                    if (err) {
                        res.status(422).json({ error: err })
                    } else {
                        const token = jwt.sign({ _id: req.body.userId }, process.env.JWT_SECRET)
                        const { mobileNumber, following, followers, email, user_name, name } = result

                        //invitation mail for the signup
                        transporter.sendMail({
                            to: email,
                            from: "travo.socialmedia@gmail.com",
                            subject: "Signup success",
                            html: "<h1>Welcome to Travo</h1><br><h2> We are waiting for you</h2>"
                        })
                        res.status(200).json({ token, user: { mobileNumber, following, followers, email, user_name, name } })
                    }
                })

        })
    }

})


exports.otpVerification = async (req, res) => {
    const { otp, mobileNumber } = req.body
    const verification_check = await client.verify.services(serviceToken)
        .verificationChecks
        .create({ to: `+91${mobileNumber}`, code: otp })
    if (verification_check.status == "approved") {
        const user = new User({ mobileNumber })
        user.save().then((user) => {
            console.log(user)
            const { _id } = user
            return res.status(200).json({ message: "Your mobile number is sucessfully verified", _id })
        })
    } else {
        return res.status(401).json({ error: "Please check the otp" })
    }

}

exports.userSignin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({ error: "Please fill the details" })
    }
    const userData = await User.findOne({ email })
    if (!userData) {
        return res.status(401).json({ error: "Entered email is wrong" })
    }
    const ifMatched = await bcrypt.compare(password, userData.password)
    if (ifMatched) {
        //creating jwt token with payload as user_id
        const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET)
        const { mobileNumber, following, followers, email, user_name, name, _id } = userData
        res.status(200).json({ token, user: { mobileNumber, following, followers, email, user_name, name, _id } })
    } else {
        res.status(401).json({ error: "Eneterd password is incorrect" })
    }
})


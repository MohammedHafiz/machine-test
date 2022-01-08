const User = require('../models/user');
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.EMAIL_TOKEN
    }
}))


exports.resetPassword = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({ email: req.body.email }).then((user) => {
            if (!user) {
                return res.status(422).json({ error: "User with this email doesn't exist" })
            }
            user.resetToken = token;
            user.expireToken = Date.now() + 3600000
            user.save().then((result) => {
                transporter.sendMail({
                    to: user.email,
                    from: "travo.socialmedia@gmail.com",
                    subject: "Reset Password",
                    html: `
                <p>You requested for password reset</p>
                <h5>please click this <a href="https://travosocialmedia.herokuapp.com/api/auth/reset-password/${token}">link </a> to reset your password</h5>`
                    // <h5>please click this <a href="http://localhost:3000/reset-password/${token}">link </a> to reset your password</h5>
                })
                res.json({ message: "New password link has send to your registered email" })
            })
        })

    })
}

exports.newPassword = (req, res) => {
    const newPassword = req.body.password;
    const resetToken = req.body.resetToken;
    User.findOne({ resetToken: resetToken, expireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).json({ error: "Try again session expired" })
            }
            bcrypt.hash(newPassword, 10).then(hashedPassword => {
                user.password = hashedPassword;
                user.resetToken = undefined;
                user.expireToken = undefined;
                user.save().then((userDetails) => {
                    res.status(200).json({ message: "Password updated successfully" })
                })
            })
        }).catch(err => {
            console.log(err)
        })

}

exports.followUser = (req, res) => {
    User.findByIdAndUpdate(req.body.followerId, {
        $addToSet: { followers: req.user._id }
    }, {
        new: true
    }, async (err, result) => {
        if (err) {
            res.status(401).json({ err: err })
        }
        const results = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { following: req.body.followerId }
        }, {
            new: true
        }).select("-password")
        res.status(200).json({ result: results })


    })
}

exports.unfollowUser = (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            res.status(401).json({ error: err })
        }
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, {
            new: true
        })
            .select('-password')
            .then(result => {
                res.status(200).json({ result: result })
            })
    })
}

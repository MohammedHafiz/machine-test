const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    user_name: {
        type: String,
        unique: true
    },
    mobileNumber: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        min: 8,
        max: 16
    },
    profile_pic: {
        type: String,
        default: ""

    },
    following: [{
        type: ObjectId,
        ref: "User"
    }],
    followers: [{
        type: ObjectId,
        ref: "User"
    }],
    gender: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    resetToken: String,
    expireToken: Date

},
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
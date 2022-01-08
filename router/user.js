const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { resetPassword, newPassword, followUser, unfollowUser } = require('../controller/user')


router.post('/reset-password', resetPassword)

router.post('/new-password', newPassword)

router.post('/follow', verifyToken, followUser)

router.post('/unfollow', verifyToken, unfollowUser)

module.exports = router
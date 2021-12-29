const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {create_post,my_post,followers_post,postLike,postdislike,postComment,delete_comment,edit_comment,delete_post} = require('../controller/post')

router.post('/create_post',verifyToken,create_post);

router.get('/my_post',verifyToken,my_post)

router.get('/followers_post',verifyToken,followers_post)

router.put('/like',verifyToken,postLike)

router.put('/dislike',verifyToken,postdislike)

router.put('/comment',verifyToken,postComment)

router.delete('/delete_comment/:postId/:commentId',verifyToken,delete_comment)

router.put('/edit_comment/:postId/:commentId',verifyToken,edit_comment)

router.delete('/delete_post/:postId',verifyToken,delete_post)







module.exports = router;

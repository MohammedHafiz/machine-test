const Post = require('../models/post')
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

exports.create_post = (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        return res.status(422).json({ message: "please fill all the details" })
    }
    const post = new Post({
        title,
        description,
        postedBy: req.user
    })
    post.save()
        // .populate('postedBy',"user_name _id email")
        .then(result => {
            res.status(200).json({ result: result })
        }).catch(err => {
            console.log(err)
        })

}

exports.my_post = (req, res) => {
    Post.findOne({
        postedBy: req.user._id
    })
        .populate("postedBy", "_id user_name ")
        .then(result => {
            res.status(200).json({ result: result })
        }).catch(err => {
            console.log(err)
        })

}

exports.followers_post = (req, res) => {
    Post.find({
        postedBy: { $in: req.user.following }
    }).populate("postedBy", "_id user_name ")
        .then(result => {
            console.log(result)
            res.status(200).json({ result: result })
        }).catch(err => {
            res.status(401).json({ error: err })
        })

}

exports.postLike = (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $addToSet: { likes: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            res.status(401).json({ error: err })
        }
        res.status(200).json({ result: result })
    })
}

exports.postdislike = (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            res.status(401).json({ error: err })
        }
        res.status(200).json({ result: result })
    })
}

exports.postComment = (req, res) => {
    console.log(req.user._id)
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id user_name")
        .exec((err, result) => {
            if (err) {
                return res.status(401).json({ error: err })
            }
            res.status(200).json({ result: result })
        })
}

exports.delete_comment = (req, res) => {
    Post.findByIdAndUpdate(req.params.postId, {
        $pull: {comments: {_id: req.params.commentId } }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(401).json({ error: err })
        }
        return res.status(200).json({ result: result })
    })

}

exports.edit_comment =(req,res) => {
    const {postId,commentId} = req.params
    const {text} = req.body
     Post.updateOne({"comments._id": commentId},{
          $set:{"comments.$.text":text}
      },async(err, result) => {
        if (err) {
            return res.status(401).json({ error: err })
        }
        const post = await Post.findOne({_id:postId})
        res.status(200).json({ result:post})
    })
}


exports.delete_post= (req,res)=>{
    const id = req.params.postId
    Post.findById(id)
    .populate("postedBy","_id")
    .exec((err,post) => {
        if(err || !post){
            return res.status(401).json({ error: err })
        }
        if((post.postedBy._id).toString() === (req.user._id).toString()){
            post.remove()
            .then(result=>{
                res.status(200).json({message:"succesfully deleted"})
            }).catch(err => {
                console.log(err)
            })
        }
    })
}


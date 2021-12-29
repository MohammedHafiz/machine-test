const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;
const postSchema = new mongoose.Schema({
    title:{
        type : String,
        required: true,
    },
    description:{
        type:String,
        required : true
    },
    location:{
          type: {
            type: String,
            enum: ['Point'],
            // required: true
          },
          coordinates: {
            type: [Number],
            // required: true
          }        
    },
    photo:{
        type: String,
        default: 'no photo'
    },
    likes:[{
        type: ObjectId,
        ref : "User"
    }],
    comments:[{
        text:String,
        postedBy:{ type:ObjectId,ref:"User"}
    }],
    postedBy:{
        type: ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Post",postSchema)
const mongoose = require("mongoose");
const { Schema,model } = require("mongoose");

const PostSchema = new Schema({
    title:String,
    summary:String,
    content:String,
    cover:String,
    author:{type:Schema.Types.ObjectId, ref:'User'},
    viewcount: { type: Number, default: 0, integer: true },
    likecount: { type: Number, default: 0, integer: true },
    comments: [{text:String, created:{type: Date, default:Date.now}}]
},{
    timestamps:true,
});

const PostModel=model('Post',PostSchema);

module.exports = PostModel;
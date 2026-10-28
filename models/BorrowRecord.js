const m=require('mongoose');
module.exports=m.model('BorrowRecord',new m.Schema({
 user:{type:m.Schema.Types.ObjectId,ref:'User',required:true},
 book:{type:m.Schema.Types.ObjectId,ref:'Book',required:true},
 borrowedAt:{type:Date,default:Date.now},dueDate:{type:Date,required:true},returnedAt:Date,
 fine:{type:Number,default:0},status:{type:String,enum:['borrowed','returned'],default:'borrowed'}
},{timestamps:true}));

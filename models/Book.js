const m=require('mongoose');
module.exports=m.model('Book',new m.Schema({
 title:{type:String,required:true,trim:true},author:{type:String,required:true,trim:true},
 isbn:{type:String,required:true,unique:true,trim:true},category:{type:String,required:true,trim:true},
 publisher:String,year:Number,description:String,coverImage:String,
 totalCopies:{type:Number,required:true,min:1},
 availableCopies:{type:Number,required:true,min:0}
},{timestamps:true}));

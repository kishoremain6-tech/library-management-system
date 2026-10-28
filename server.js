require('dotenv').config();
const express=require('express'),mongoose=require('mongoose'),cookieParser=require('cookie-parser'),path=require('path');
if(!process.env.MONGODB_URI||!process.env.JWT_SECRET){console.error('Set MONGODB_URI and JWT_SECRET in .env');process.exit(1);}
const app=express();
app.use(express.json());app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/books',require('./routes/books'));
app.use('/api/loans',require('./routes/loans'));
app.use('/api',(req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>{
  if(err.name==='ValidationError')err.status=400;
  if(err.code===11000){err.status=409;err.message='Duplicate value (email or ISBN already exists)';}
  if(err.name==='CastError'){err.status=400;err.message='Invalid id';}
  if(!err.status)console.error(err);
  res.status(err.status||500).json({message:err.message||'Server error'});
});
mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000})
 .then(()=>{console.log('MongoDB connected');app.listen(process.env.PORT||3000,()=>console.log('http://localhost:'+(process.env.PORT||3000)));})
 .catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1);});

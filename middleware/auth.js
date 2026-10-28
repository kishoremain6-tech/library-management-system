const jwt=require('jsonwebtoken'),User=require('../models/User');
exports.protect=async(req,res,next)=>{
 try{const t=req.cookies.token;if(!t)return res.status(401).json({message:'Please log in'});
  const {id}=jwt.verify(t,process.env.JWT_SECRET);const u=await User.findById(id);
  if(!u)return res.status(401).json({message:'User no longer exists'});req.user=u;next();
 }catch(e){res.status(401).json({message:'Session expired, please log in again'});}
};
exports.adminOnly=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({message:'Admin access required'});

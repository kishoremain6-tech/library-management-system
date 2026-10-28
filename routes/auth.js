const r=require('express').Router(),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),User=require('../models/User');
const {protect,adminOnly}=require('../middleware/auth');
const okEmail=e=>/^\S+@\S+\.\S+$/.test(e||'');
const send=(res,u)=>{const t=jwt.sign({id:u._id},process.env.JWT_SECRET,{expiresIn:'1d'});
 res.cookie('token',t,{httpOnly:true,sameSite:'strict',maxAge:864e5});
 res.json({user:{id:u._id,name:u.name,email:u.email,role:u.role}});};
r.post('/register',async(q,s,n)=>{try{
 return s.status(403).json({message:'New members must be registered by library staff'});
}catch(e){n(e);}});
r.post('/members',protect,adminOnly,async(q,s,n)=>{try{
 const {name,email,password}=q.body;
 if(!name||name.trim().length<2)return s.status(400).json({message:'Name must be at least 2 characters'});
 if(!okEmail(email))return s.status(400).json({message:'Enter a valid email'});
 if(!password||password.length<8)return s.status(400).json({message:'Password must be at least 8 characters'});
 const u=await User.create({name:name.trim(),email:email.toLowerCase().trim(),password:await bcrypt.hash(password,12),role:'student'});
 s.status(201).json({user:{id:u._id,name:u.name,email:u.email,role:u.role}});
}catch(e){n(e);}});
r.post('/login',async(q,s,n)=>{try{
 const {email,password}=q.body;if(!okEmail(email)||!password)return s.status(400).json({message:'Email and password required'});
 const u=await User.findOne({email}).select('+password');
 if(!u||!(await bcrypt.compare(password,u.password)))return s.status(401).json({message:'Invalid email or password'});send(s,u);
}catch(e){n(e);}});
r.post('/logout',(q,s)=>{s.clearCookie('token');s.json({message:'Logged out'});});
r.get('/me',protect,(q,s)=>s.json({user:q.user}));
r.put('/me',protect,async(q,s,n)=>{try{
 const {name,password}=q.body;if(name){if(name.trim().length<2)return s.status(400).json({message:'Name too short'});q.user.name=name;}
 if(password){if(password.length<8)return s.status(400).json({message:'Password must be at least 8 characters'});q.user.password=await bcrypt.hash(password,12);}
 await q.user.save();s.json({user:q.user});
}catch(e){n(e);}});
r.get('/users',protect,adminOnly,async(q,s,n)=>{try{s.json(await User.find().sort('-createdAt'));}catch(e){n(e);}});
module.exports=r;

// Creates the admin from .env and a few CLEARLY LABELLED sample books (only if no books exist).
require('dotenv').config();const m=require('mongoose'),bcrypt=require('bcryptjs'),User=require('./models/User'),Book=require('./models/Book');
(async()=>{try{
 const {ADMIN_NAME,ADMIN_EMAIL,ADMIN_PASSWORD}=process.env;if(!ADMIN_EMAIL||!ADMIN_PASSWORD)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
 await m.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
 if(!await User.exists({email:ADMIN_EMAIL.toLowerCase()})){await User.create({name:ADMIN_NAME||'Admin',email:ADMIN_EMAIL,password:await bcrypt.hash(ADMIN_PASSWORD,12),role:'admin'});console.log('Admin created');}
 if(!await Book.countDocuments()){const s=[['Sample: Intro to Algorithms','A. Author','SAMPLE-001','Computer Science'],['Sample: Modern Physics','B. Writer','SAMPLE-002','Science'],['Sample: World History','C. Scholar','SAMPLE-003','History']];
  await Book.insertMany(s.map(([title,author,isbn,category])=>({title,author,isbn,category,totalCopies:3,availableCopies:3,description:'Sample data for testing.'})));console.log('Sample books added');}
}catch(e){console.error(e.message);process.exitCode=1;}finally{await m.disconnect();}})();

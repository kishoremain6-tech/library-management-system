const r=require('express').Router(),Book=require('../models/Book'),Loan=require('../models/BorrowRecord'),User=require('../models/User');
const {protect,adminOnly}=require('../middleware/auth');
const DAYS=()=>+process.env.LOAN_DAYS||14,RATE=()=>+process.env.FINE_PER_DAY||5,MAX=()=>+process.env.MAX_ACTIVE_LOANS||3;
const fineOf=l=>{const end=l.returnedAt||new Date();const d=Math.ceil((end-l.dueDate)/864e5);return d>0?d*RATE():0;};
const view=l=>{const o=l.toObject();o.overdue=l.status==='borrowed'&&new Date()>l.dueDate;o.fine=l.status==='borrowed'?fineOf(l):l.fine;return o;};
const pop=q=>q.populate('book','title author isbn').populate('user','name email');
async function issue(userId,bookId){
 if(await Loan.exists({user:userId,book:bookId,status:'borrowed'}))throw Object.assign(new Error('Already borrowed this book'),{status:409});
 if(await Loan.countDocuments({user:userId,status:'borrowed'})>=MAX())throw Object.assign(new Error('Borrowing limit of '+MAX()+' reached'),{status:409});
 const b=await Book.findOneAndUpdate({_id:bookId,availableCopies:{$gt:0}},{$inc:{availableCopies:-1}});
 if(!b)throw Object.assign(new Error('Book unavailable or not found'),{status:409});
 return Loan.create({user:userId,book:bookId,dueDate:new Date(Date.now()+DAYS()*864e5)});
}
r.use(protect);
r.post('/borrow',async(q,s,n)=>{try{s.status(201).json(await issue(q.user._id,q.body.bookId));}catch(e){n(e);}});
r.post('/issue',adminOnly,async(q,s,n)=>{try{
 if(!await User.exists({_id:q.body.userId}))return s.status(404).json({message:'User not found'});
 s.status(201).json(await issue(q.body.userId,q.body.bookId));}catch(e){n(e);}});
r.post('/:id/return',adminOnly,async(q,s,n)=>{try{
 const l=await Loan.findOne({_id:q.params.id,status:'borrowed'});if(!l)return s.status(409).json({message:'Loan not found or already returned'});
 l.returnedAt=new Date();l.fine=fineOf(l);l.status='returned';await l.save();
 await Book.findByIdAndUpdate(l.book,{$inc:{availableCopies:1}});s.json(view(l));}catch(e){n(e);}});
r.get('/mine',async(q,s,n)=>{try{s.json((await pop(Loan.find({user:q.user._id}).sort('-borrowedAt'))).map(view));}catch(e){n(e);}});
r.get('/stats',adminOnly,async(q,s,n)=>{try{
 const [bk,students,borrowed,all]=await Promise.all([Book.find(),User.countDocuments({role:'student'}),Loan.find({status:'borrowed'}),pop(Loan.find().sort('-updatedAt').limit(8))]);
 s.json({totalBooks:bk.reduce((a,b)=>a+b.totalCopies,0),titles:bk.length,availableBooks:bk.reduce((a,b)=>a+b.availableCopies,0),
  borrowedBooks:borrowed.length,students,overdue:borrowed.filter(l=>new Date()>l.dueDate).length,recent:all.map(view)});}catch(e){n(e);}});
r.get('/',adminOnly,async(q,s,n)=>{try{
 const f={};if(q.query.status)f.status=q.query.status;
 let l=(await pop(Loan.find(f).sort('-borrowedAt'))).map(view);if(q.query.overdue==='true')l=l.filter(x=>x.overdue);s.json(l);}catch(e){n(e);}});
module.exports=r;

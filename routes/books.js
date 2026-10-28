const r=require('express').Router(),Book=require('../models/Book'),Loan=require('../models/BorrowRecord');
const {protect,adminOnly}=require('../middleware/auth');
const esc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pick=b=>{const o={};['title','author','isbn','category','publisher','year','description','coverImage','totalCopies'].forEach(k=>{if(b[k]!==undefined&&b[k]!=='')o[k]=b[k];});return o;};
r.use(protect);
r.get('/',async(q,s,n)=>{try{
 const {q:term,category,available}=q.query,f={};
 if(term){const x=new RegExp(esc(term),'i');f.$or=[{title:x},{author:x},{isbn:x},{category:x}];}
 if(category)f.category=category;if(available==='true')f.availableCopies={$gt:0};if(available==='false')f.availableCopies=0;
 s.json({books:await Book.find(f).sort('title'),categories:await Book.distinct('category')});
}catch(e){n(e);}});
r.get('/:id',async(q,s,n)=>{try{const b=await Book.findById(q.params.id);b?s.json(b):s.status(404).json({message:'Book not found'});}catch(e){n(e);}});
r.post('/',adminOnly,async(q,s,n)=>{try{const d=pick(q.body);d.totalCopies=+d.totalCopies;d.availableCopies=d.totalCopies;s.status(201).json(await Book.create(d));}catch(e){n(e);}});
r.put('/:id',adminOnly,async(q,s,n)=>{try{
 const b=await Book.findById(q.params.id);if(!b)return s.status(404).json({message:'Book not found'});
 const d=pick(q.body);if(d.totalCopies!==undefined){const out=b.totalCopies-b.availableCopies;d.totalCopies=+d.totalCopies;
  if(d.totalCopies<out)return s.status(400).json({message:out+' copies are currently borrowed; total cannot be lower'});d.availableCopies=d.totalCopies-out;}
 Object.assign(b,d);s.json(await b.save());
}catch(e){n(e);}});
r.delete('/:id',adminOnly,async(q,s,n)=>{try{
 if(await Loan.exists({book:q.params.id,status:'borrowed'}))return s.status(409).json({message:'Book has active loans'});
 const b=await Book.findByIdAndDelete(q.params.id);b?s.json({message:'Deleted'}):s.status(404).json({message:'Book not found'});
}catch(e){n(e);}});
module.exports=r;

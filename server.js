
const express=require('express');
const app=express();
app.get('/api/profile',(req,res)=>{
 res.json({stars:10,energy:99,level:1});
});
app.listen(3001);

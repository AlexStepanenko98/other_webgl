const express=require('express');


const app=express();


app.use((req,res,next)=>{
	console.log('\x1b[1;32m'+req.url+'\x1b[0m');
	next();
});


app.get('/',(req,res)=>{	
	res.sendFile(__dirname+'/dist/index.html');
});


app.get('/bundle',(req,res)=>{	
	res.sendFile(__dirname+'/dist/bundle.js');
});


app.listen(4848,'127.0.0.1',()=>{
	console.log('\x1b[1;33mServer is working...\x1b[0m');
});

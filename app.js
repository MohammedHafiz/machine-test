const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();  

//mongoose connection 
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser : true,
    useUnifiedTopology : true
});
mongoose.connection.on('connected',()=>{
    console.log('Connected to MongoDB')
})
mongoose.connection.on('error',(err)=>{
    console.log("Error connecting ", err)
})

const authRoute = require('./router/auth')
const postRoute = require('./router/post')

app.use(express.json());
app.use('/api/auth',authRoute)
app.use('/api/post',postRoute)

app.get('/',(req,res)=>{
    res.send("hey its me")
})

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({
      message: err.message,
      //stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    })
  })
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
  })

app.use(passport.initialize())

app.listen(PORT,()=>{
    console.log("Server is running at ",PORT);
})

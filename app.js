const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const dotenv = require('dotenv');
const helmet = require('helmet')
const morgan = require('morgan');


const PORT = process.env.PORT || 4000;
dotenv.config();

//mongoose connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB')
})
mongoose.connection.on('error', (err) => {
  console.log("Error connecting ", err)
})

const authRoute = require('./router/auth')
const postRoute = require('./router/post')
const userRoute = require('./router/user')

//middleware
app.use(express.json());
app.use(passport.initialize())
app.use(helmet())
app.use(morgan("common"));


app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)
app.use('/api/user', userRoute)

app.get('/', (req, res) => {
  res.send("hey back end is working")
})

//error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
})
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
})

//port setting
app.listen(PORT, () => {
  console.log("Server is running at ", PORT);
})

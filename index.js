const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv').config();
const cookieParser = require('cookie-parser');
const app=express();
app.use(express.json());
app.use(cookieParser());

//Define a route for uploading images
app.use('/uploads', express.static(__dirname+'/uploads'));

//Use cors to allow requests from diff url
app.use(cors({
  credentials: true,
  origin: true,
}));

//Database MONGODB with mongoose
mongoose.connect(process.env.MONGO_URL,{
  dbName: 'rentroomapp',
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//PORTS
const PORT=process.env.PORT || 4000;


//import Routes
const userLogin=require('./routes/userLogin');
const userEvents=require('./routes/userEvents');


//connect to MongoDB
mongoose.connect(process.env.DB_CONNECT)
    .then(()=>console.log('DB Connected'))
    .catch(err=>console.log(err))

//Use the routes;
app.use('/',userLogin);
app.use('/',userEvents);


// CONNECT TO SERVER ON PORT GIVEN
app.listen(PORT,()=>console.log(`Server connected on PORT ${PORT}`))
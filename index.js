const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session');




const app=express();


app.set('trust proxy', 1);


app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {  secure: false,httpOnly:false }

}));
app.use(cors({
        origin:process.env.CLIENT_URL,
        credentials: true,}));
app.use(express.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-JSON');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, Range');
  res.header('Access-Control-Request-Headers', 'X-Requested-With, accept, content-type');
  req.headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});


//Define a route for uploading images
app.use('/uploads', express.static(__dirname+'/uploads'));




//PORTS
const PORT=process.env.PORT || 4000;


//import Routes
const userLogin=require('./routes/userLogin');
const userEvents=require('./routes/userEvents');

//Database MONGODB with mongoose
mongoose.connect(process.env.MONGO_URL,{
  dbName: 'rentroomapp',
  useNewUrlParser: true,
  useUnifiedTopology: true
});



//Use the routes;
app.use('/',userLogin);
app.use('/',userEvents);


// CONNECT TO SERVER ON PORT GIVEN
app.listen(PORT,()=>console.log(`Server connected on PORT ${PORT}`))
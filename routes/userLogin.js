const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User') 
const router = require('express').Router();
const bcryptSalt = bcrypt.genSaltSync(10);
const dotenv=require('dotenv').config();


const jwtSecret = process.env.jwtSecret
const tokenValue='w4r5r3wq45wdfgw34';
const options = { expiresIn: '1h' };

//Test
router.get('/test', (req,res) => {
    res.json('test ok');
  });
  
//REGISTER REQUEST
router.post('/register', async (req,res) => {
    const {name,email,password} = req.body;
  
    try {
      const userDoc = await User.create({
        name,
        email,
        password:bcrypt.hashSync(password, bcryptSalt),
      });
      res.json(userDoc);
    } catch (e) {
      res.status(422).json(e);
    }
  
});
  


//LOGIN REQUEST
router.post('/login', async (req,res) => {
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc){
    const passOk = bcrypt.compareSync(password, userDoc.password);
    console.log(userDoc)
    if(passOk){
      const token=jwt.sign({email:userDoc.email, id:userDoc._id, name:userDoc.name}, jwtSecret, options);
        // Store JWT token in client-side storage
        req.session.token = token;
        res.json(userDoc)
    } 
  } 
 }
)
    
    
  

//LOGOUT REQUEST

router.post('/logout', (req,res) => {
  req.session.destroy();
  res.send('Logged out successfully');
  });
  

module.exports=router;
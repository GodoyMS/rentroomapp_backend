const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User') 
const router = require('express').Router();
const bcryptSalt = bcrypt.genSaltSync(10);
const dotenv=require('dotenv').config();


const jwtSecret = process.env.jwtSecret

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
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    console.log(userDoc)
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id,
        name:userDoc.name
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.status(404).json('not found');
  }
});
  

//LOGOUT REQUEST

router.post('/logout', (req,res) => {
    res.cookie('token', '').json(true);
  });
  

module.exports=router;
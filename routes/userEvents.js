
const RentPlace=require('../models/RentPlace.js');
const Favorites = require ('../models/Favorites.js');

const User=require('../models/User.js')

const jwt = require('jsonwebtoken');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const dotenv=require('dotenv').config();

const router = require('express').Router();
const jwtSecret = process.env.jwtSecret



function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
      jwt.verify(req.cookies.token, jwtSecret, {}, async (err, decodedUserData) => {
        if (err) throw err;
        resolve(decodedUserData);
      });
    });
  }


  //Get user information
  router.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, decodedUserData) => {
        if (err) throw err;
        const {name,email,shortDescription,_id} = await User.findById(decodedUserData.id);
        res.json({name,email,shortDescription,_id});
      });
    } else {
      res.json(null);
    }
  });


    //Update user information
    router.put('/update-profile', async (req,res) => {
      const {token} = req.cookies;
      const {name,email,shortDescription} = req.body;
      console.log(req.body);
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;

        const userDoc = await User.findOne({email:email})

        if (userData.id === userDoc._id.toString()) {
          userDoc.set({name,email,shortDescription});
          await userDoc.save();
          res.json('user updated');

        }
    
      });
    });



  router.post('/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
  });
  
    //route handler then loops through each uploaded file,
    // renames it to include the file extension, and pushes 
    //the new path to an array called uploadedFiles. 
    //Max number of uploads at once: 100
  const photosMiddleware = multer({dest:'uploads/'});
  router.post('/upload', photosMiddleware.array('photos', 100), (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const {path,originalname} = req.files[i];
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      const newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath.replace('uploads/',''));
    }
    res.json(uploadedFiles);
  });


  //Get all rentplaces   
  router.get('/rentplaces', async (req,res) => {
    res.json( await RentPlace.find().populate('owner') );
  });

   //Get rentplaces by id  
   router.get('/rentplaces/:id', async (req,res) => {
    const {id} = req.params;
    res.json(await RentPlace.findById(id).populate('owner'));
  });



  //Get all rentplaces by user
  router.get('/user-rentplaces', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, decodedUserData) => {
      const {id} = decodedUserData;
      console.log(decodedUserData)
      res.json( await RentPlace.find({owner:id}) );
    });
  });

  
  // Post a new rent place by user
  router.post('/account/rentplaces/post', (req,res) => {
    const {token} = req.cookies;
    const {
      title,country,region,address,addedPhotos,description,
      perks,extraInfo,maxPeople,monthlyPrice
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, decodedUserData) => {
      if (err) throw err;
      const placeDoc = await RentPlace.create({
        owner:decodedUserData.id,ownerName:decodedUserData.name,country,region,
        title,address,photos:addedPhotos,description,
        perks,extraInfo,maxPeople,monthlyPrice,date:new Date()
      });
      res.json(placeDoc);
      console.log(decodedUserData)
    });
  });  

  //Update rentplaces by user
  router.put('/account/rentplace/update', async (req,res) => {
    const {token} = req.cookies;
    const {
      id, title,country,region,address,addedPhotos,description,
      perks,extraInfo,maxPeople,monthlyPrice,availability
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await RentPlace.findById(id);
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,address,country,region,photos:addedPhotos,description,
          perks,extraInfo,maxPeople,monthlyPrice,availability
        });
        await placeDoc.save();
        res.json('ok');
      }
    });
  });

  //Delete a rentplace in userAcc
   router.delete('/account/rentplaces/:id', async (req,res) => {
    try {
      const {token} = req.cookies;
  
      jwt.verify(token, jwtSecret, {}, async (err, decodedUserData) => {
        const idObject = req.params.id;

        const deletedObject = await RentPlace.findByIdAndDelete(idObject); 
        if (!deletedObject) {
          return res.status(404).send('Resource not found');
        }
        res.status(204).send();
           });

    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting resource');
    }

    
  
  });



  

  //Post a favorite rentplace by user
  router.post('/account/postfavorite', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const {
      rentPlace,name,monthlyPrice,
    } = req.body;
    const rentPlaceExists= await Favorites.findOne({rentPlace:rentPlace,user:userData.id})
    console.log(typeof(rentPlaceExists))
    if(rentPlaceExists){
      res.statusMessage="Item already added to favorites"
      res.json('No')

      
    }else{
      Favorites.create({
        rentPlace,user:userData.id,name,monthlyPrice      
      }).then((doc) => {
        res.statusMessage="Added to favorites"
        res.json(doc);


      }).catch((err) => {
        throw err;
      });
    }
    
  });
  
  
  //Get all favorites rentPlaces per user
  router.get('/account/retrievefavorites', async (req,res) => {
    const userData = await getUserDataFromReq(req);
    res.json( await Favorites.find({user:userData.id}).populate('rentPlace') );
  });


    //Delete a favorite rentroom in userAcc
    router.delete('/account/deletefavorite/:id', async (req,res) => {
      try {
        const {token} = req.cookies;
    
        jwt.verify(token, jwtSecret, {}, async (err, decodedUserData) => {
          const idObject = req.params.id;
  
          const deletedObject = await Favorites.findByIdAndDelete(idObject); 
          if (!deletedObject) {
            return res.status(404).send('Resource not found');
          }
          res.status(204).send();
             });
  
      } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting resource');
      }
  
      
    
    });


  module.exports=router;
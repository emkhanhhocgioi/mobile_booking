const express = require('express');
const routerAdmin = express.Router();
const {admingettk,getHotel,
    getOrder,getReview,
deletetk,deletehotel,deleteReview,deleteOrder,
uploadImageToCloudinary,createDestination,renderDestinationImg,renderDestination,deletDestination}  = require('../Controller/AdminController') ;

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for multer (files will be uploaded directly to Cloudinary)
const storage = multer.memoryStorage();
  
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
})



routerAdmin.post('/admin/upload-image',upload.single('file'),uploadImageToCloudinary)
routerAdmin.post('/admin/createdestination',createDestination)
routerAdmin.get('/admin/getuser',admingettk)
routerAdmin.get('/getDestination',renderDestination)
routerAdmin.get('/images/getdestimg',renderDestinationImg)
routerAdmin.post('/admin/deleteuser',deletetk)
routerAdmin.get('/admin/gethotel',getHotel)
routerAdmin.post('/admin/deletehotel',deletehotel)
routerAdmin.get('/admin/getorder',getOrder)
routerAdmin.post('/admin/deleteOrder',deleteOrder)
routerAdmin.get('/admin/getreview',getReview)
routerAdmin.post('/admin/deleteReview',deleteReview)
routerAdmin.post('/admin/deleteDest',deletDestination)

module.exports = routerAdmin;
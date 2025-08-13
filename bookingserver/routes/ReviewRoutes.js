
const express = require('express')
const routerReview = express.Router();
const {createReview,renderReviewIamge,renderReview,getAverageRating} = require('../Controller/ReviewController') ;
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

  routerReview.post('/createReview', upload.array('file', 2), async (req, res) => {
    
    if (req.files && req.files.length > 2) {
        return res.status(400).send('Chỉ cho phép tối đa 2 tệp hình ảnh');
    }

   
    await createReview(req, res);
});
routerReview.get('/renderReviewImg',renderReviewIamge)
routerReview.get('/renderReview',renderReview)
routerReview.get('/getAverageRating',getAverageRating)


module.exports = routerReview;
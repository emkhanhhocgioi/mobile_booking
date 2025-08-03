
const express = require('express');
const routerPost = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { route } = require('./accountRoutes');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const {createPost,fecthUserPost, fecthAllPost,
   renderPostImage
  ,countrating,sortingPost,updatePost,deleteExistPostimg,fetchUserFollowed,
  getgptdata} = require('../Controller/PostController')

// Use memory storage for multer (files will be uploaded directly to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
})

routerPost.post('/createpost', upload.array('file'), createPost);
routerPost.get("/getuserpost",fecthUserPost)
routerPost.get('/getpost',fecthAllPost)
routerPost.get('/getpostimg',renderPostImage)
routerPost.get('/countRating',countrating)
routerPost.post('/getpost/sorted',sortingPost)
routerPost.put('/updatepost', upload.array('file',4), updatePost)
routerPost.put('/delete/postexistimg', deleteExistPostimg)
routerPost.get('/fetchUserFollowed',fetchUserFollowed)
routerPost.get('/gemini/generate',getgptdata)
module.exports = routerPost;
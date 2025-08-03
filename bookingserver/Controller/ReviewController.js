const Review = require('../Model/ReviewModel')
const User = require('../Model/Accounts')
const Post = require('../Model/PostModel')
const ObjectId  = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const { default: axios } = require('axios');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryHelper');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createReview = async (req, res) => {
    const { reviewId, hotelid, reviewerId, reviewcontent, rating } = req.body;
    console.log(req.body.reviewId);  

    // Kiểm tra các giá trị bắt buộc
    if (!hotelid || !reviewerId || !reviewcontent || !rating || !reviewId) {
        return res.status(400).json({ message: 'Missing required input values' });
    }

    try {
        let imageUrls = [];
        
        // If files are uploaded, upload them to Cloudinary
        if (req.files && req.files.length > 0) {
            try {
                const uploadResults = await uploadMultipleToCloudinary(req.files, {
                    folder: `reviews/${reviewId}`,
                    public_id: `review_${reviewId}_${Date.now()}`
                });
                imageUrls = uploadResults.map(result => result.secure_url);
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: 'Error uploading images' });
            }
        }

        // Tạo document review mới
        const doc = new Review({
            ReviewID: reviewId,
            HotelID: hotelid,
            ReviewerID: reviewerId,
            reviewcontent: reviewcontent,
            rating: rating,
            images: imageUrls // Store Cloudinary URLs
        });

        const savedReview = await doc.save();
      
        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            imageUrls: imageUrls
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error creating review',
        });
    }
};

const renderReview = async (req, res) => {
    const { hotelid } = req.query;
    console.log(req.query);

    if (!hotelid) {
        return res.status(400).json('No hotel ID provided');
    }

    try {
        const docs = await Review.find({ HotelID: hotelid });

        if (docs && docs.length > 0) {
            // Lấy username cho từng ReviewerID
            const formattedReview = await Promise.all(docs.map(async doc => {
                const username = await getUsernameById(doc.ReviewerID);
                return {
                    rvid: doc._id,
                    HotelID: doc.HotelID,
                    ReviewerID: doc.ReviewerID,
                    reviewerName: username,
                    reviewcontent: doc.reviewcontent,
                    rating: doc.rating,
                    imgArr: doc.images || [],
                };
            }));

            console.log(formattedReview);
            return res.json(formattedReview);
        } else {
            return res.status(400).json({ error: 'No reviews found for the specified hotel.' });
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Server error, please try again later.' });
    }
};

const getUsernameById = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user ? user.username : 'Unknown User';
    } catch (error) {
        console.error('Error fetching user:', error);   
        return 'Unknown User';
    }
};

const renderReviewIamge = async (req, res) => {
    const { reviewId } = req.query;
    console.log(reviewId);
    
    if (!reviewId) {
        return res.status(400).json({ message: 'Review ID is required' });
    }
    
    try {
        const review = await Review.findOne({ ReviewID: reviewId });
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        if (!review.images || review.images.length === 0) {
            return res.status(404).json({ message: 'No images found for this review' });
        }
        
        // Return the Cloudinary URLs directly
        return res.status(200).json({ 
            success: true, 
            images: review.images 
        });
        
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
  


  module.exports = {createReview,renderReviewIamge,renderReview}
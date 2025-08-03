const taikhoan = require('../Model/accounts');
const Order =  require('../Model/OrdersModels')
const Review = require('../Model/ReviewModel')
const Post = require('../Model/PostModel');
const Taikhoan = require('../Model/accounts');
const Dest = require('../Model/Destination');
const mongoose =require('mongoose')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const admingettk = async (req,res) => {
    try {
        const docs  = await taikhoan.find({urole: 
            {$in: [1,2]}})
        const rtndoc = docs.map(doc => ({
            id:doc._id,
            Username: doc.Username,
            Email:doc.Email,
            PhoneNumber:doc.PhoneNumber,
            urole:doc.urole,
        }));
        res.json(rtndoc)
    } catch (error) {
        console.log(error)
    }
}
const deletetk = async (req, res) => {
    const { id } = req.query;

    try {

        const doc = await taikhoan.findByIdAndDelete({_id:id});
        if (doc) {

            return res.status(200).json({ message: "Tài khoản đã được xóa thành công.", data: doc });
        } else {

            return res.status(404).json({ message: "Không tìm thấy tài khoản với ID này." });
        }
    } catch (err) {
     
        console.error(err);
        return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa.", error: err.message });
    }
};

const getHotel = async (req, res) => {
    try {
     
        const docs = await Post.find({});

        
        const rtndoc = docs.map(doc => ({
            PostID: doc.PostID,
            PosterID: doc.PosterID,
            HotelName: doc.HotelName,
            Address: doc.Address,
            price: doc.price,
            city: doc.city,
            country: doc.country,
        }));

       
        const documentHotel = await Promise.all(
            rtndoc.map(async (doc) => {
                
                const tkdoc = await Taikhoan.findOne({ _id: doc.PosterID });

                if (!tkdoc) {
                    return {
                        ...doc,
                        tkdetails: null,
                    };
                }

                return {
                    ...doc,
                    tkdetails: {
                        id: tkdoc._id,
                        Username: tkdoc.Username,
                    },
                };
            })
        );

      
        res.status(200).json(documentHotel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu.", error: error.message });
    }
};
const deletehotel = async (req, res) => {
    const { id } = req.body; 
    console.log(req.body)
    try {
      
        const doc = await Post.findOneAndDelete({ PostID: id });

        if (doc) {
            return res.status(200).json({ message: "Tài khoản đã được xóa thành công.", data: doc });
        } else {
            return res.status(404).json({ message: "Không tìm thấy tài khoản với ID này." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Đã xảy ra lỗi trong quá trình xóa.",
            error: err.message
        });
    }
};

const getOrder = async (req,res) =>{
    try {
        const docs  = await Order.find({})
        const rtndoc = docs.map(doc => ({
            id:doc._id,
            Customerid: doc.UserID,
            Hotelid:doc.HotelID,
            Checkindate:doc.Checkindate,
            Checkoutdate:doc.Checkoutdate,
            orderDay:doc.orderDay,
            orderStatus:doc.orderStatus,
        }));
        res.json(rtndoc)
    } catch (error) {
        console.log(error)
    }
}
const deleteOrder = async (req, res) => {
    const { id } = req.query;

    try {

        const doc = await Order.findByIdAndDelete(id);
        if (doc) {

            return res.status(200).json({ message: "Tài khoản đã được xóa thành công.", data: doc });
        } else {

            return res.status(404).json({ message: "Không tìm thấy tài khoản với ID này." });
        }
    } catch (err) {
     
        console.error(err);
        return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa.", error: err.message });
    }
};

const getReview = async(req,res) =>{
    try {
        const docs  = await Review.find({})
        const rtndoc = docs.map(doc => ({
            id:doc._id,
            ReviewID: doc.ReviewID,
            HotelID:doc.HotelID,
            ReviewerID:doc.ReviewerID,
            reviewcontent:doc.reviewcontent,
            orderDay:doc.orderDay,
            orderStatus:doc.orderStatus,
        }));
        res.json(rtndoc)
    } catch (error) {
        console.log(error)
    }
}
const deleteReview = async (req, res) => {
    const { id } = req.body;
    console.log(req.body)
    try {

        const doc = await Order.findOneAndDelete(id);
        if (doc) {

            return res.status(200).json({ message: "Tài khoản đã được xóa thành công.", data: doc });
        } else {

            return res.status(404).json({ message: "Không tìm thấy tài khoản với ID này." });
        }
    } catch (err) {
     
        console.error(err);
        return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa.", error: err.message });
    }
};
const createDestination = async(req,res) =>{
    const {DestinationName,destcountry,DestinationDesc} = req.body;

    if(!DestinationName){
        res.status(400).json('no destination name')
        return;
    }
    if(!DestinationDesc){
        res.status(400).json('no description')
        return;
    }
    if (!req.file) {
        return res.status(400).json({ error: 'Missing file' });
    }
    
    console.log(DestinationName,DestinationDesc)
    
    try {
        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
            folder: 'destinations',
            public_id: `dest_${DestinationName}_${Date.now()}`
        });

        const doc = new Dest({
            DestinationName: DestinationName,
            DestinationDesc: DestinationDesc,
            DestinationCountry: destcountry,
            Destinationimg: uploadResult.secure_url,
        })
        
        await doc.save();
        res.status(200).json({
            message: 'Create destination success',
            imageUrl: uploadResult.secure_url
        })
    } catch (error) {
        console.error('Error creating destination:', error);
        res.status(500).json({ error: error.message })
    }
}
const renderDestination = async (req, res) => {
    try {
        const docs = await Dest.find({});
   
        const formatdocs = docs.map(doc => ({
            id: doc._id,
            destname: doc.DestinationName,
            destcountry: doc.DestinationCountry,
            desc: doc.DestinationDesc,
            img: doc.Destinationimg, // Direct Cloudinary URL
        }));

        res.json(formatdocs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const renderDestinationImg = async (req,res) =>{
    const { destId } = req.query;
    console.log(destId);
    
    if (!destId) {
        return res.status(400).json({ message: 'Destination ID is required' });
    }
    
    try {
        const destination = await Dest.findById(destId);
        
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        
        if (!destination.Destinationimg) {
            return res.status(404).json({ message: 'No image found for this destination' });
        }
        
        // Return the Cloudinary URL directly
        return res.status(200).json({ 
            success: true, 
            imageUrl: destination.Destinationimg 
        });
        
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
const deletDestination = async (req,res) =>{
    const { id } = req.body;
    console.log(req.body)
    try {

        const doc = await Dest.findByIdAndDelete(id);
        if (doc) {

            return res.status(200).json({ message: "Tài khoản đã được xóa thành công.", data: doc });
        } else {

            return res.status(404).json({ message: "Không tìm thấy tài khoản với ID này." });
        }
    } catch (err) {
     
        console.error(err);
        return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa.", error: err.message });
    }
}
module.exports ={admingettk,deletetk,
    getHotel,deletehotel,
    getOrder,getReview,
    deleteReview,deleteOrder,
    createDestination,
    renderDestinationImg,renderDestination,deletDestination
}
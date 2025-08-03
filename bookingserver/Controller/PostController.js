
require('dotenv').config();

const Post = require('../Model/PostModel');
const Review = require('../Model/ReviewModel');
const Follow = require("../Model/FollowModel");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require('cloudinary').v2;

const geminiApiKey = 'AIzaSyBqc9mH68VLJ8WmJPBD6gtzjxibROr_IwQ'; 

const genAI = new GoogleGenerativeAI(geminiApiKey); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});
  

const createPost = async(req,res) =>{
    console.log('=== POST CREATE REQUEST DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files ? req.files.length : 0);
    console.log('Files details:', req.files);
    
    if (!req.files || req.files.length === 0) {
        console.log('No files uploaded error');
        return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const {PostID,posterID,hotelname,Address,Price,
        city,country,describe,Addon,posterName,
        freewifi,freefood } = req.body;
        
    // Validate required fields
    if (!PostID || !posterID || !hotelname || !Address || !Price || !city || !country || !describe) {
        console.log('Missing required fields:', {
            PostID: !!PostID,
            posterID: !!posterID,
            hotelname: !!hotelname,
            Address: !!Address,
            Price: !!Price,
            city: !!city,
            country: !!country,
            describe: !!describe
        });
        return res.status(400).json({ message: 'Missing required fields' });
    }
    
    console.log('All validation passed, proceeding with post creation and image upload');
    try{
        const existingPostID =  await Post.findOne({PostID:PostID})
        if(!existingPostID){
            // Upload images to Cloudinary first
            const uploadPromises = req.files.map(file => uploadImageToCloudinary(file, PostID));
            const uploadResults = await Promise.all(uploadPromises);
            const imageUrls = uploadResults.map(result => result.secure_url);
            
            console.log('Images uploaded successfully:', imageUrls);
            
            const document = await new Post({
                PostID:PostID,
                PosterID:posterID,
                HotelName:hotelname,
                Address:Address,
                price:Price,
                city:city,
                country:country,
                describe:describe,
                addon:Addon,
                Posterimage:imageUrls, // Save image URLs as array
                rating:0,
            });
            
            await document.save();
            return res.status(201).json({
                success: true,
                message: 'Post created successfully with images',
                imageUrls: imageUrls
            });
        }else{
            return res.status(400).json({
                success: false,
                message: 'Post with this ID already exists',
            });
        }
       
    }catch(error){
        console.log('Error creating post:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the post',
            error: error.message
        });
    }

}

// Helper function to upload images to Cloudinary
const uploadImageToCloudinary = async (file, postID) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `posts/${postID}`,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        
        uploadStream.end(file.buffer);
    });
};

// Function to upload multiple images for a post
const fecthUserPost = async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        console.log('No user ID');
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const documents = await Post.find({ PosterID: userID });

        if (documents.length > 0) {
            const formattedDocuments = documents.map(doc => {
                return {
                    PostID: doc.PostID,
                    PosterID: doc.PosterID,
                    HotelName: doc.HotelName,
                    Address: doc.Address,
                    price: doc.price,
                    city: doc.city,
                    country: doc.country,
                    describe: doc.describe,
                    addon: doc.addon,
                    rating: doc.rating,
                    imgArr: doc.Posterimage || [] // Đổi thành imgArr giống fetchAllPost
                };
            });
            res.json({ post: formattedDocuments });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error fetching user post:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
const fetchUserFollowed = async (req, res) => {
  const { userID } = req.query;

  if (!userID) {
    console.log('No user ID');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const followlist = await Follow.find({ userid: userID });

    if (followlist.length > 0) {
      const formattedDocuments = await Promise.all(followlist.map(async doc => {
        const documents = await Post.find({ PostID: doc.followid });
        
        return documents.map(fl => {
          return {
            PostID: fl.PostID,
            HotelName: fl.HotelName,
            Address: fl.Address,
            price: fl.price,
            city: fl.city,
            country: fl.country,
            describe: fl.describe,
            addon: fl.addon,
            rating: fl.rating,
            images: fl.Posterimage || [] // Use Posterimage array directly
          };
        });
      }));
      const flattenedDocuments = formattedDocuments.flat();

      res.json({ post: flattenedDocuments });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching user follow:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const fecthAllPost = async (req, res) => {
    try {
        const posts = await Post.aggregate([{ $sample: { size: 10 } }]);

        const formattedPosts = posts.map((post) => {
            return {
                PostID: post.PostID,
                PosterID: post.PosterID,
                HotelName: post.HotelName,
                Address: post.Address,
                price: post.price,
                city: post.city,
                country: post.country,
                describe: post.describe,
                addon: post.addon,
                rating: post.rating,
                imgArr: post.Posterimage || [], // Use Posterimage array directly
            };
        });

        res.json({
            posts: formattedPosts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
const countrating  = async(req,res) =>{
    const {postid} = req.query;
    
    try {
        
        const ratings = await Review.find({ HotelID: postid });

        if (ratings.length > 0) {
         
            const totalRating = ratings.reduce((sum, rate) => sum + rate.rating, 0);
            const averageRating = totalRating / ratings.length;

            console.log(`Average rating: ${averageRating}`);
            res.json(averageRating)
        } else {
            console.log("No ratings found for this hotel.");
}
      
      

    } catch (error) {
        
        
    }
}

const sortingPost = async (req, res) => {
    const { postSelectedValue, selectedvldata } = req.body;
  
    // Validate input
    if (!postSelectedValue || !selectedvldata) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }
  
    // Logging inputs for debugging
    console.log(postSelectedValue);
    console.log(selectedvldata);
  
    try {
    
      const docs = await Promise.all(
        postSelectedValue.map(async (vl) => {
          const documents = await Promise.all(
            selectedvldata.map(async (data) => {
       
              const result = await Post.find({ [vl]: data });
              
              const formattedDocuments = result.map((rs) => {
                return {
                  PostID: rs.PostID,
                  PosterID: rs.PosterID,
                  HotelName: rs.HotelName,
                  Address: rs.Address,
                  price: rs.price,
                  city: rs.city,
                  country: rs.country,
                  describe: rs.describe,
                  addon: rs.addon,
                  rating: rs.rating,
                  imgArr: rs.Posterimage || [], // Use Posterimage array directly
                };
              });
              return formattedDocuments; 
            })
          );
  
          return documents.flat(); 
        })
      );
  
      // Flatten the final result
      const flatendocs = docs.flat(); 
      console.log(flatendocs);
      res.json(flatendocs); 
  
    } catch (error) {
     
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  

const updatePost = async (req, res) => {
  console.log('=== UPDATE POST REQUEST DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Received request body:', req.body);
  console.log('req.file exists:', !!req.file);
  console.log('req.files exists:', !!req.files);
  console.log('req.files type:', typeof req.files);
  console.log('req.files isArray:', Array.isArray(req.files));
  console.log('Received files count:', req.files ? req.files.length : 0);
  console.log('Files details:', req.files);
  
  // Log all properties of req to see what's available
  console.log('All req properties with files:', Object.keys(req).filter(key => key.includes('file')));
  
  // Check if files exist in body (sometimes files get parsed into body)
  console.log('Files in body:', Object.keys(req.body).filter(key => key.includes('file')));
  
  // Log the actual file data structure if it exists
  if (req.files && req.files.length > 0) {
    console.log('First file structure:', {
      fieldname: req.files[0].fieldname,
      originalname: req.files[0].originalname,
      encoding: req.files[0].encoding,
      mimetype: req.files[0].mimetype,
      buffer: req.files[0].buffer ? 'Buffer exists' : 'No buffer',
      size: req.files[0].size
    });
  }

  const { PostID, HotelName, Address, price, city, country, describe, addon } = req.body;

  console.log('Extracted fields:', {
    PostID,
    HotelName,
    Address,
    price,
    city,
    country,
    describe,
    addon
  });

  // Kiểm tra dữ liệu yêu cầu
  if (!PostID || !HotelName || !Address || !price || !city || !country || !describe || !addon) {
    console.log('Missing required fields validation:', {
      PostID: !!PostID,
      HotelName: !!HotelName,
      Address: !!Address,
      price: !!price,
      city: !!city,
      country: !!country,
      describe: !!describe,
      addon: !!addon
    });
    return res.status(400).json('Missing required data');
  }

  try {
    console.log('Searching for post with PostID:', PostID);
    
    // Lấy post hiện tại
    const post = await Post.findOne({ PostID: PostID });
    if (!post) {
      console.log('No post found with PostID:', PostID);
      return res.status(400).json({ message: 'No hotel found' });
    }

    console.log('Found existing post:', {
      PostID: post.PostID,
      HotelName: post.HotelName,
      currentImageCount: post.Posterimage ? post.Posterimage.length : 0
    });

    let imageUrls = post.Posterimage || [];
    console.log('Current image URLs:', imageUrls);
    
    // Filter out invalid/empty image URLs from existing images
    const validExistingImages = imageUrls.filter(url => {
      const isValid = url && 
                     url.trim() !== '' && 
                     url !== 'null' && 
                     url !== 'undefined' &&
                     url !== '""' &&
                     url !== "''";
      if (!isValid) {
        console.log('Filtering out invalid image URL:', url);
      }
      return isValid;
    });
    
    console.log('Valid existing images after filtering:', validExistingImages.length);
    imageUrls = validExistingImages;

    // Handle existing images from client if provided
    const existingImageCount = req.body.existingImageCount ? parseInt(req.body.existingImageCount) : 0;
    console.log('Client reported existing image count:', existingImageCount);
    
    if (existingImageCount > 0) {
      // Get existing image URLs from client
      const clientExistingImages = [];
      for (let i = 0; i < existingImageCount; i++) {
        const imageUrl = req.body[`existingImage_${i}`];
        if (imageUrl && imageUrl.trim() !== '') {
          clientExistingImages.push(imageUrl);
        }
      }
      console.log('Client existing images:', clientExistingImages);
      
      // Use client's existing images if provided, otherwise use filtered server images
      if (clientExistingImages.length > 0) {
        imageUrls = clientExistingImages;
        console.log('Using client-provided existing images');
      }
    }

    // Nếu có file upload mới thì upload lên Cloudinary và cập nhật Posterimage
    if (req.files && req.files.length > 0) {
      console.log('Processing new image uploads...');
      
      const uploadPromises = req.files.map(file => uploadImageToCloudinary(file, PostID));
      const uploadResults = await Promise.all(uploadPromises);
      const newImageUrls = uploadResults.map(result => result.secure_url);
      
      console.log('New images uploaded successfully:', newImageUrls);
      
      imageUrls = imageUrls.concat(newImageUrls); // Giữ ảnh cũ, thêm ảnh mới
      console.log('Updated image URLs array:', imageUrls);
    } else {
      console.log('No new files to upload');
    }

    console.log('Updating post data...');
    
    // Filter out any remaining invalid URLs before saving
    const finalImageUrls = imageUrls.filter(url => {
      const isValid = url && 
                     url.trim() !== '' && 
                     url !== 'null' && 
                     url !== 'undefined' &&
                     url !== '""' &&
                     url !== "''";
      return isValid;
    });
    
    console.log('Final image URLs count:', finalImageUrls.length);
    console.log('Final image URLs:', finalImageUrls);
    
    // Cập nhật thông tin post
    post.HotelName = HotelName;
    post.Address = Address;
    post.price = price;
    post.city = city;
    post.country = country;
    post.describe = describe;
    post.addon = addon;
    post.Posterimage = finalImageUrls;

    console.log('Post data before save:', {
      PostID: post.PostID,
      HotelName: post.HotelName,
      Address: post.Address,
      price: post.price,
      city: post.city,
      country: post.country,
      describe: post.describe,
      addon: post.addon,
      imageCount: post.Posterimage.length,
      imageUrls: post.Posterimage
    });

    await post.save();
    console.log('Post saved successfully');

    return res.status(200).json({ message: 'Data update successful', hotel: post });
  } catch (error) {
    console.error('Error updating post:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: "Error updating hotel data",
      details: error.message 
    });
  }
};
  
const deleteExistPostimg = async (req, res) => {
  const { postid } = req.body;
  console.log(postid)

  if (!postid) {
    return res.status(400).json({ error: 'Missing postid' });
  }

  try {
    // Delete all images in the post folder from Cloudinary
    const cloudinaryResponse = await cloudinary.search
      .expression(`folder:posts/${postid}`)
      .execute();

    if (cloudinaryResponse.resources.length === 0) {
      return res.status(200).json({ message: 'No images found for the given postid' });
    }

    // Delete all images found
    const deletePromises = cloudinaryResponse.resources.map(resource => 
      cloudinary.uploader.destroy(resource.public_id)
    );

    await Promise.all(deletePromises);

    // Also try to delete the folder (this will only work if the folder is empty)
    try {
      await cloudinary.api.delete_folder(`posts/${postid}`);
    } catch (folderError) {
      console.log('Folder deletion failed (may not be empty):', folderError.message);
    }

    return res.status(200).json({ message: 'Images deleted successfully' });
  } catch (error) {
    console.error('Error deleting images:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const renderPostImage = async (req, res) => {
  try {
    const { PostID } = req.query;
    
    if (!PostID) {
      return res.status(400).json({ error: 'PostID is required' });
    }

    // Get post from database and return Posterimage array
    const post = await Post.findOne({ PostID: PostID });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      PostID: PostID,
      images: post.Posterimage || []
    });
  } catch (error) {
    console.error('Error fetching post images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post images',
      details: error.message
    });
  }
};

const getgptdata = async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const docs = await Post.find({});
    const datadocs = await Promise.all(
      docs.map(async (doc) => {
        const ratings = await Review.find({ HotelID: doc.PostID });
        let averageRating = 0; 
        
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rate) => sum + rate.rating, 0);
          averageRating = totalRating / ratings.length;
        }
        
        return {
          hotelid: doc.PostID,
          HotelName: doc.HotelName,
          Address: `${doc.Address}, ${doc.city}, ${doc.country}`,
          rating: averageRating,
        };
      })
    );
    
    const jsonResult = JSON.stringify(datadocs, null, 2);
    
    const result = await model.generateContent(prompt + ' send data which is in ' + jsonResult + ' as a detail post');
    
    
    const text = result|| "No content available";

    return res.status(200).json({text: text });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({ success: false, error: "Failed to generate content" });
  }
};


module.exports  = {createPost,fecthUserPost,
    fecthAllPost,renderPostImage,
    countrating,
    sortingPost,updatePost,deleteExistPostimg,
    fetchUserFollowed,getgptdata}
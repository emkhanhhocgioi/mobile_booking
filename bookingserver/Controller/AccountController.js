const taikhoan = require('../Model/accounts');
const mongoose = require('mongoose');
const {Types} = require('mongoose');
const Subscript =require('../Model/PreniumModel') ;
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// Remove GridFS related code as we're now using Cloudinary








const signup = async (req, res) => {
    const { uname, email, password,PhoneNumber } = req.body;

    if (!uname) {
        return res.status(400).json({ message: 'Username is required' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    try {
        const existingUser = await taikhoan.findOne({ Email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        } 
        const newtk = new taikhoan({
            Username: uname,
            Email: email,
            Password: password,
            urole: 2,
            Desc: ' ',
            PhoneNumber:PhoneNumber,
            followercount: 0,
            followingcount: 0,
            imgProfile: ' ',
        });
        await newtk.save();
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const signupPartner = async (req, res) => {
  const { uname, email, password,PhoneNumber } = req.body;

  if (!uname) {
      return res.status(400).json({ message: 'Username is required' });
  }
  if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }
  if (!password) {
      return res.status(400).json({ message: 'Password is required' });
  }
  if (!PhoneNumber) {
    return res.status(400).json({ message: 'phone number is required' });
}
try {
  const existingUser = await taikhoan.findOne({ Email: email });
  if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
  }


  const newtk = new taikhoan({
      Username: uname,
      Email: email,
      Password: password,
      urole: 1,
      Desc: ' ',
      PhoneNumber: PhoneNumber,
      followercount: 0,
      followingcount: 0,
      imgProfile: ' ',
  });

  
  await newtk.save();

 
  const newSubscript = new Subscript({
      Userid: newtk._id,  
      status: 0,
      signupdate: new Date(),
      expiredate: new Date(),
  });


  await newSubscript.save();

  return res.status(201).json({ message: 'User created and subscribed successfully' });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Server error' });
}
};


const login = async (req, res) => {
     const { uname, password } = req.body;

     if (!uname) {
        return res.status(400).json({ message: 'please input username' });
     }
     if (!password) {
        return res.status(400).json({ message: 'please input password' });
     }
     try {
        const document = await taikhoan.findOne({ Username: uname });
        if (document) {
            if (document.Password != password) {
                return res.status(400).json({ message: 'wrong user password' });
            }
             const logindata = {
                uid:document._id,
                urole:document.urole
             }
            return res.send(logindata);
        }
     } catch (error) {
        console.log(error);
        return res.status(500).send(error);
     }
};

const getUserData = async (req, res) => {
  const { uid } = req.query;
  console.log(uid);
  if (!uid) {
    return res.status(400).json({ message: 'No user found' });
  }

  try {
    const document = await taikhoan.findOne({ _id: uid });
    // Removed: const files = await gfs.find().toArray();

    if (!document) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedDocument = {
      ObjecID: document._id,
      Email: document.Email,
      urole: document.urole,
      Desc: document.Desc,
      PhoneNumber: document.PhoneNumber,
      followercount: document.followercount,
      followingcount: document.followingcount,
      imgProfile: document.imgProfile, // This is the Cloudinary URL
    };

    res.json(formattedDocument);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserProfileImage = async (req, res) => {
  const { username } = req.query;
  console.log(username);
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  
  try {
    const user = await taikhoan.findOne({ Username: username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.imgProfile) {
      return res.status(404).json({ message: 'No profile image found' });
    }
    
    // Return the Cloudinary URL directly
    return res.status(200).json({ 
      success: true, 
      imageUrl: user.imgProfile 
    });
    
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


const editProfile = async (req, res) => {
    const { username, email, desc } = req.body;
    console.log('[editProfile] Input:', { username, email, desc });

    if (!username) {
        console.log('[editProfile] No username provided');
        return res.status(400).json({ message: 'No username provided' });
    }

    try {
        console.log('[editProfile] Finding and updating user...');
        const updatedUser = await taikhoan.findOneAndUpdate(
            { Username: username },  
            { $set: { Email: email, Desc: desc } },  
            { new: true }  
        );

        if (!updatedUser) {
            console.log('[editProfile] No user found for username:', username);
            return res.status(400).json({ message: 'No user found' });
        }

        console.log('[editProfile] Update successful:', updatedUser);

        return res.status(200).json({ message: 'Data update successful', user: updatedUser });

    } catch (error) {
        console.error('[editProfile] Error updating user data:', error);
        res.status(500).send("Error updating user data");
    }
};

const uploadProfile = async (req, res) => {
  console.log('[uploadProfile] === REQUEST RECEIVED ===');
  console.log('[uploadProfile] Request body:', req.body);
  console.log('[uploadProfile] File info:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    size: req.file.size,
    buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'No buffer'
  } : 'No file');

  const { uid, username, desc } = req.body;
 
  try {
    // Find user by username or uid
    let user;
    if (username) {
      user = await taikhoan.findOne({ Username: username });
      console.log('[uploadProfile] Found user by username:', username);
    } else if (uid) {
      user = await taikhoan.findOne({ _id: uid });
      console.log('[uploadProfile] Found user by uid:', uid);
    } else {
      console.log('[uploadProfile] No username or UID provided');
      return res.status(400).json({ message: 'Username or UID is required' });
    }

    if (!user) {
      console.log('[uploadProfile] User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    let imageUrl = user.imgProfile; // Keep existing image if no new file uploaded

    // If a new file is uploaded, upload it to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        console.log('[uploadProfile] Processing new image upload...');
        
        // Delete old image from Cloudinary if it exists and is not empty
        if (user.imgProfile && user.imgProfile.trim() !== '' && user.imgProfile !== ' ' && user.imgProfile.startsWith('http')) {
          try {
            // Extract public_id from Cloudinary URL
            const urlParts = user.imgProfile.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            console.log('[uploadProfile] Deleting old image with public_id:', publicId);
            await deleteFromCloudinary(publicId);
          } catch (deleteError) {
            console.warn('[uploadProfile] Could not delete old image:', deleteError.message);
            // Continue with upload even if delete fails
          }
        }

        // Upload new image to Cloudinary
        console.log('[uploadProfile] Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: 'profile_images',
          public_id: `profile_${user.Username}_${Date.now()}`,
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        imageUrl = uploadResult.secure_url;
        console.log('[uploadProfile] New image uploaded successfully:', imageUrl);
        
      } catch (uploadError) {
        console.error('[uploadProfile] Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Error uploading image', 
          error: uploadError.message 
        });
      }
    } else {
      console.log('[uploadProfile] No file buffer found, keeping existing image');
    }
    
    // Update user profile with new data
    const updateData = {
      Desc: desc || user.Desc,
      imgProfile: imageUrl
    };

    console.log('[uploadProfile] Updating user with data:', updateData);

    const updatedUser = await taikhoan.findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      console.log('[uploadProfile] Failed to update user profile');
      return res.status(500).json({ message: 'Failed to update user profile' });
    }

    console.log('[uploadProfile] Profile updated successfully for user:', user.Username);

    return res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.Username,
        email: updatedUser.Email,
        desc: updatedUser.Desc,
        imageUrl: updatedUser.imgProfile
      }
    });
  } catch (error) {
    console.error('[uploadProfile] Error updating user data:', error);
    res.status(500).json({ 
      message: "Error updating user data", 
      error: error.message 
    });
  }
};
const resetPassword= async(req,res) =>{
  const{email,newpassword} =req.body;
  if(!email || !newpassword){
    console.log('missing required field')
  } 
  try {
    const doc = await taikhoan.findOneAndUpdate({Email:email},
      { $set: { Password: newpassword } },
      {new:true})
      if (!doc) {
        return res.status(404).json({ error: 'User not found' });
      }
    return res.json({ message: 'Password has been updated successfully' });

  } catch (error) {
    console.log(error)
  }
}


module.exports = { signup, login, getUserData, editProfile, uploadProfile, getUserProfileImage,signupPartner,resetPassword };

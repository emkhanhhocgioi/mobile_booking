const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test function to upload image to Cloudinary via your API
async function testCloudinaryUpload() {
  try {
    const formData = new FormData();
    
    // Add required fields
    formData.append('DestinationName', 'Test Destination');
    formData.append('DestinationDesc', 'This is a test destination');
    formData.append('destcountry', 'Vietnam');
    
    // Create a simple test image (you can replace this with an actual image file)
    // For this test, we'll create a simple buffer
    const testImageBuffer = Buffer.from('test image data');
    formData.append('file', testImageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post('http://localhost:5000/api/admin/createdestination', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

// Run the test
console.log('Testing Cloudinary upload...');
testCloudinaryUpload();

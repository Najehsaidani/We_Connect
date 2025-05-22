// Simple script to test the image upload
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('Testing image upload...');
    
    // Use event ID 1 from the previous test
    const eventId = 1;
    
    // Create a form data object
    const formData = new FormData();
    
    // Create a simple test image file
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'This is a test image file');
    
    // Add the file to the form data
    formData.append('file', fs.createReadStream(testImagePath));
    
    console.log(`Uploading image for event ID: ${eventId}`);
    
    const response = await axios.post(
      `http://localhost:9191/api/events/${eventId}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('Response:', response.data);
    console.log('Image uploaded successfully!');
    
    // Clean up the test file
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error('Error uploading image:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

testImageUpload();

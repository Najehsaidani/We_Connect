// Simple script to test the API
const axios = require('axios');

async function testEventCreation() {
  try {
    console.log('Testing event creation...');
    
    const eventData = {
      titre: 'Test Event',
      description: 'This is a test event',
      lieu: 'Test Location',
      dateDebut: new Date().toISOString(),
      dateFin: new Date(new Date().getTime() + 3600000).toISOString(),
      status: 'AVENIR'
    };
    
    console.log('Event data:', JSON.stringify(eventData, null, 2));
    
    const response = await axios.post(
      'http://localhost:9191/api/events/create?createurId=1',
      eventData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Response:', response.data);
    console.log('Event created successfully!');
  } catch (error) {
    console.error('Error creating event:');
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

testEventCreation();

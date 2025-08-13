const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.POLYGON_KEY || 'GW2Dm91_PtRLfU_NpHQ3LKG8gASIT5b6';

console.log('API Key:', API_KEY);
console.log('API Key length:', API_KEY.length);

async function testPolygonAPI() {
    const url = `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=${API_KEY}`;
    
    console.log('Testing URL:', url);
    
    try {
        const response = await axios.get(url);
        console.log('Success!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error details:');
        console.error('Status:', error.response?.status);
        console.error('Status text:', error.response?.statusText);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testPolygonAPI();


const axios = require('axios');

async function testDownload() {
    const url = 'https://sora.chatgpt.com/p/s_699400f5af6c8191b89fa660781fa37b';
    try {
        console.log('Testing /api/download with URL:', url);
        const response = await axios.post('http://localhost:3000/api/download', { url });

        console.log('Response Status:', response.status);
        console.log('Success:', response.data.success);

        if (response.data.data && response.data.downloads) {
            console.log('Video Title:', response.data.data.title.substring(0, 50) + '...');
            const noWatermark = response.data.downloads.find(d => d.quality.includes('No Watermark'));
            if (noWatermark) {
                console.log('Found "No Watermark" video URL:', noWatermark.url.substring(0, 50) + '...');
            } else {
                console.error('No "No Watermark" video found in response.');
            }
        } else {
            console.error('Invalid response structure:', response.data);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

testDownload();

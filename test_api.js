const axios = require('axios');
const fs = require('fs');

async function testDownloadFlow() {
    const targetUrl = 'https://sora.chatgpt.com/p/s_699400f5af6c8191b89fa660781fa37b';
    const baseUrl = 'http://localhost:3000';

    try {
        console.log('1. Fetching Video Metadata...');
        const metaResponse = await axios.post(`${baseUrl}/api/download`, { url: targetUrl });

        if (!metaResponse.data.success) {
            throw new Error(`Metadata fetch failed: ${metaResponse.data.msg}`);
        }

        const videoData = metaResponse.data.data;
        console.log(`   Success! Title: ${videoData.title.substring(0, 30)}...`);

        const noWatermark = videoData.downloads.find(d => d.quality.includes('No Watermark'));
        if (!noWatermark) {
            throw new Error('No watermark link not found');
        }

        console.log('2. Testing Stream Download...');
        const streamUrl = `${baseUrl}/api/stream-download?url=${encodeURIComponent(noWatermark.url)}`;

        const streamResponse = await axios({
            method: 'GET',
            url: streamUrl,
            responseType: 'stream'
        });

        console.log(`   Stream status: ${streamResponse.status}`);
        console.log(`   Content-Type: ${streamResponse.headers['content-type']}`);

        // Simple check if stream is readable
        streamResponse.data.on('data', (chunk) => {
            // Just read one chunk to verify connectivity then destroy
            console.log(`   Received data chunk size: ${chunk.length}`);
            streamResponse.data.destroy();
            console.log('   Stream test passed!');
        });

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testDownloadFlow();

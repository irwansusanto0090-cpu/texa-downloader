document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const btnLoader = document.getElementById('btnLoader');
    const btnText = document.querySelector('.btn-text');
    const btnIcon = document.querySelector('.btn-icon');
    const errorMsg = document.getElementById('errorMsg');
    const resultSection = document.getElementById('resultSection');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const downloadLink = document.getElementById('downloadLink');
    const videoDuration = document.getElementById('videoDuration');
    const videoViews = document.getElementById('videoViews');

    downloadBtn.addEventListener('click', handleDownload);

    /* Allow Enter key to trigger download */
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    async function handleDownload() {
        const url = videoUrlInput.value.trim();

        // 1. Validation
        if (!url) {
            showError('Please enter a valid Sora video URL.');
            return;
        }

        if (!url.includes('sora.chatgpt.com')) {
            showError('Invalid URL. Please enter a valid Sora link.');
            return;
        }

        // 2. Set Loading State
        setLoading(true);
        hideError();
        resultSection.classList.remove('visible');
        videoPlayer.pause();
        videoPlayer.src = '';

        try {
            // 3. API Request
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            // 4. Handle Response
            if (data.success && data.data) {
                displayResult(data.data);
            } else {
                showError(data.msg || 'Failed to download video. Please try again.');
            }

        } catch (error) {
            console.error('Download error:', error);
            showError('An error occurred. Please check your connection and try again.');
        } finally {
            // 5. Reset Loading State
            setLoading(false);
        }
    }

    function displayResult(data) {
        // Find No Watermark video
        const downloads = data.downloads || [];
        const noWatermarkVideo = downloads.find(d => d.quality.includes('No Watermark') || d.quality.includes('HD'));

        if (!noWatermarkVideo) {
            showError('Could not find a downloadable video stream.');
            return;
        }

        // Update DOM
        videoTitle.textContent = data.title || 'Untitled Video';
        videoPlayer.src = noWatermarkVideo.url;
        videoPlayer.poster = data.thumbnail;
        // Direct Download Link via Proxy
        const proxyUrl = `/api/stream-download?url=${encodeURIComponent(noWatermarkVideo.url)}`;
        downloadLink.href = proxyUrl;
        downloadLink.removeAttribute('target');
        downloadLink.download = 'sora-video.mp4';

        // Update Meta Info (if available, otherwise hide or set default)
        if (data.views) {
            videoViews.innerHTML = `<i class="fa-regular fa-eye"></i> ${data.views}`;
        }

        // Show Result
        resultSection.classList.add('visible');

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            downloadBtn.disabled = true;
            btnLoader.style.display = 'block';
            btnText.style.display = 'none';
            btnIcon.style.display = 'none';
        } else {
            downloadBtn.disabled = false;
            btnLoader.style.display = 'none';
            btnText.style.display = 'block';
            btnIcon.style.display = 'block';
        }
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.add('visible');
        errorMsg.style.height = 'auto';
        errorMsg.style.opacity = '1';
    }

    function hideError() {
        errorMsg.textContent = '';
        errorMsg.classList.remove('visible');
        errorMsg.style.height = '0';
        errorMsg.style.opacity = '0';
    }
});

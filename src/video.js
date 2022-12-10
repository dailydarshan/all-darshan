const videoshow = require('videoshow');

const getImages = require('./download');

async function createVideo(temple, darshanDate) {
    const images = await getImages(temple, darshanDate);
    console.log(images);
    if (!images.length) {
        return;
    }

    const videoOptions = {
        fps: 25,
        loop: 5, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '1080x?',
        audioBitrate: '128k',
        audioChannels: 2,
        format: 'mp4',
        pixelFormat: 'yuv420p',
    }

    const processedImages = images.filter(n => n);
    processedImages.push({path: './logo/last.png'});
    try {
        let loop = round((60 - processedImages.length) / (processedImages.length));
        if (loop > 5) {
            loop = 5;
        }
        videoOptions.loop = loop;
    } catch (error) { }

    return new Promise((resolve, reject) => {
        const audioName = getRandomInt(14);
        videoshow(processedImages, videoOptions)
            .audio(`./audio/${audioName}.mp3`)
            .save(`${temple}.mp4`)
            .on('start', function (command) {
                console.log('ffmpeg process started:', command)
            })
            .on('error', function (err, stdout, stderr) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
                reject(err);
            })
            .on('end', function (output) {
                console.error('Video created in:', output)
                resolve(output);
            })
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


module.exports = createVideo;
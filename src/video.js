const videoshow = require('videoshow');

const getImages = require('./download');

async function createVideo(darshanDate) {
    const images = await getImages(darshanDate);
    console.log(images);
    if (!images.length) {
        return;
    }

    const videoOptions = {
        fps: 25,
        loop: 8, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '1920x?',
        audioBitrate: '128k',
        audioChannels: 2,
        format: 'mp4',
        pixelFormat: 'yuv420p',
    }

    const processedImages = images.filter(n => n);
    processedImages.push({path: './logo/last.png'});
    try {
        let loop = round((62 - processedImages.length + 1 ) / (processedImages.length));
        if (loop < 8 ) {
            loop = 8;
        }
        videoOptions.loop = loop;
    } catch (error) { }

    return new Promise((resolve, reject) => {
        const audioName = getRandomInt(7);
        videoshow(processedImages, videoOptions)
            .audio(`./audio/${audioName}.mp3`)
            .save(`all.mp4`)
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

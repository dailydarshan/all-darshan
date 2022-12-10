const videoshow = require('videoshow');

const getImages = require('./download');

async function createVideo( temple, darshanDate ) {
    const images = await getImages( temple, darshanDate );
    console.log( images );
    if ( ! images.length ) {
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
        useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
        subtitleStyle: {
            Fontname: "Verdana",
            Fontsize: "48",
            PrimaryColour: "11861244",
            SecondaryColour: "11861244",
            TertiaryColour: "11861244",
            BackColour: "-2147483640",
            Bold: "2",
            Italic: "0",
            BorderStyle: "2",
            Outline: "2",
            Shadow: "3",
            Alignment: "2", // left, middle, right
            MarginL: "40",
            MarginR: "60",
            MarginV: "40"
        }
    }

    const processedImages = images.filter(n => n);
    try {
        let loop = round( (60 - processedImages.length) / ( processedImages.length ) );
        if ( loop > 5 ) {
            loop = 5;
        }
        videoOptions.loop = loop;
    } catch (error) {}

    return new Promise( (resolve, reject) => {
        videoshow(processedImages, videoOptions)
            .audio('../audio/1.mp3')
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

module.exports = createVideo;
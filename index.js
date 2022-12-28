const createVideo = require('./src/video');
const upload = require('./src/upload');
const getTodayDate = require('./src/utils');
const temple = process.env.TEMPLE;
const darshanDate = getTodayDate();


async function run() {
    await createVideo( temple, darshanDate );
    console.log("Video Generated");
    console.log("Start Uploading to Youtube.");
    await upload( temple, getTodayDate(true) );
    console.log("Video Uploaded to Youtube!!");
}

run();

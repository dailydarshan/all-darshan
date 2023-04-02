const createVideo = require('./src/video');
const upload = require('./src/upload');
const getTodayDate = require('./src/utils');
const darshanDate = getTodayDate();


async function run() {
    await createVideo( darshanDate );
    console.log("Video Generated");
    console.log("Start Uploading to Youtube.");
    await upload( getTodayDate(true) );
    console.log("Video Uploaded to Youtube!!");
}

run();

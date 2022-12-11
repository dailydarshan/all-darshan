const createVideo = require('./src/video');
const upload = require('./src/upload');
const temple = process.env.TEMPLE;
const darshanDate = getTodayDate();


async function run() {
    await createVideo( temple, darshanDate );
    console.log("Video Generated");
    console.log("Start Uploading to Youtube.");
    await upload( temple, darshanDate );
    console.log("Video Uploaded to Youtube!!");
}

function getTodayDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

run();

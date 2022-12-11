const os = require('os');

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs')
const templeData = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

function getImages(mandir = '', darshanDate) {
    return getDarshanImages(darshanDate, mandir);
}

function getDarshanImages(darshanDate, mandir) {
    var apiUrl = `https://dailydarshan.world/DailyDarshan/ExportJsonDDImagesV2.php?sMandir=${mandir}&Target=real&sDarshanDate=${darshanDate}`;

    return axios.get(apiUrl)
        .then(resp => {
            const data = resp.data;
            if (data && data.images && data.images.length > 0) {
                return Promise.all(
                    data.images.map(async (image, index) => {
                        const input = (await axios({ url: image, responseType: "arraybuffer" })).data;
                        return processImage(input, index, mandir)
                    })
                );
            }
            return [];
        });
}


async function processImage(image, index, mandir) {
    const path = `./${mandir.toLowerCase()}${index}.jpg`;
    const textImage = await getTextImage(mandir);

    let image1 = await sharp(image).resize({width:1080}).toBuffer();
    const { height } = await sharp(image1).metadata();
    if(height > 1920) {
        image1 = await await sharp(image1).resize({height: 1920}).toBuffer();
    }

    const images = [
        { input: image1 },
        {
            input: './logo/logo.png',
            top: 20,
            left: 772,
            blend: 'soft-light'
        }
    ];

    if (textImage) {
        images.push(textImage);
    }
    return sharp(image)
        .blur(30)
        .resize({
            width: 1080,
            height: 1920,
        })
        .composite(images)
        .toFile(path)
        .then(() => path);

}

async function getTextImage(mandir) {
    try {
        let caption = (templeData && templeData[mandir]) ? templeData[mandir].caption || '' : '';
        caption = Buffer.from(caption, 'utf-8').toString();
        if (!caption) {
            return '';
        }

        const text = await sharp({
            text: {
                align: 'center',
                text: `<span foreground="white">${caption}</span>`,
                width: 1080,
                height: 100,
                rgba: true
            }
        }).png();
        const { width } = await text.metadata();
        const left = Math.floor( 540 - (width/2) );
        const textImage = await text.toBuffer();
        
        return { 
            input: textImage,
            top: 60,
            left,
        };
    } catch (error) {
        console.log(error);
    }
}

module.exports = getImages;
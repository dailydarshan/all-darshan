const os = require('os');

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs')
const templeData = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

const createThumbnail = require('./thumbnail');
const getTodayDate = require('./utils');

async function getImages( darshanDate) {
    const mandirs = ['Vadtal-Temple', 'Kalupur-Temple', 'Bhuj-Temple',  'Gadhada-Temple',  'Junagadh-Temple', 'Dholera-Temple' ];
    
    const images = [];
    for await (mandir of mandirs) {
        const image = await getDarshanImages(darshanDate, mandir);
        if ( image && image.length > 0 ) {
            images.push(`./${mandir}-thumbnail.jpg`);
            images.push(...image);
        }
    }
    return images;
}

function getDarshanImages(darshanDate, mandir) {
    var apiUrl = `https://dailydarshan.world/DailyDarshan/ExportJsonDDImagesV2.php?sMandir=${mandir}&Target=real&sDarshanDate=${darshanDate}`;

    return axios.get(apiUrl)
        .then(async resp => {
            const data = resp.data;
            if (data && data.images && data.images.length > 0) {

                // Generate Thumbnail Image
                let thumb = data.images[0];
                switch (mandir) {
                    case 'Bhuj-Temple':
                        if ( data.images[2] ) {
                            thumb = data.images[2];
                        }
                        break;

                    case 'Jetalpur-Temple':
                        if ( data.images[1] ) {
                            thumb = data.images[1];
                        }
                        break;

                    case 'Vadtal-Temple':
                        if ( data.images[3] ) {
                            thumb = data.images[3];
                        }
                        break;
                    
                    case 'Kalupur-Temple':
                        if ( data.images[4] ) {
                            thumb = data.images[4];
                        }
                        break;

                    default:
                        break;
                }
                thumb = (await axios({ url: thumb, responseType: "arraybuffer" })).data;
                await createThumbnail(thumb, mandir, getTodayDate(true));

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
    // const textImage = await getTextImage(mandir);

    let image1 = await sharp(image).resize({height:1080}).toBuffer();
    const { width } = await sharp(image1).metadata();
    if(width > 1920) {
        image1 = await sharp(image1).resize({width: 1920}).toBuffer();
    }

    const images = [
        { input: image1 },
        {
            input: './logo/logo.png',
            top: 20,
            left: 1610,
            blend: 'soft-light'
        }
    ];

    // if (textImage) {
    //     images.push(textImage);
    // }
    return sharp(image)
        .blur(30)
        .resize({
            width: 1920,
            height: 1080,
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
                width: 1920,
                height: 100,
                rgba: true
            }
        }).png();
        const { width } = await text.metadata();
        const left = Math.floor( 960 - (width/2) );
        const textImage = await text.toBuffer();
        
        return { 
            input: textImage,
            top: 920,
            left,
        };
    } catch (error) {
        console.log(error);
    }
}

module.exports = getImages;
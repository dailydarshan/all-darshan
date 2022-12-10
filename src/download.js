const os = require('os');

const axios = require('axios');
const sharp = require('sharp');
const templeData = require('./data.json');

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
    const path = `${os.tmpdir()}/${mandir.toLowerCase()}${index}.jpg`;
    const svgBuffer = await getTextImage(mandir);
    const images = [
        { input: image },
        {
            input: './logo/logo.png',
            top: 20,
            left: 772,
            blend: 'soft-light'
        }
    ];
    if (svgBuffer) {
        images.push({
            input: svgBuffer,
            top: 60,
            left: 0,
        });
    }
    return sharp(image)
        .blur(25)
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
        const caption = (templeData && templeData[mandir]) ? templeData[mandir].caption || '' : '';
        if (!caption) {
            return '';
        }
        const width = 1080;
        const height = 160;

        const svgImage = `
      <svg width="${width}" height="${height}">
        <style>
        .title { fill: #fff; font-size: 128px; font-weight: bold; border: 2px solid black; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" class="title">${caption}</text>
      </svg>
      `;
        const svgBuffer = Buffer.from(svgImage);
        return svgBuffer;
    } catch (error) {
        console.log(error);
    }
}

module.exports = getImages;
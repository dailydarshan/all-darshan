const os = require('os');

const axios = require('axios');
const sharp = require('sharp');
const Color = require('color');
const { getPaletteFromImageData } = require('dont-crop');
const templeData = require('./data.json');

function getImages( mandir = '', darshanDate ){
    return getDarshanImages( darshanDate, mandir );    
}

function getDarshanImages(darshanDate, mandir){
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
    const { data, info } = await sharp(image).resize({
        width: 1080,
        height: 1920,
        fit: 'contain'
    })
    .ensureAlpha()
    .toColorspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });

    if (data.length !== info.width * info.height * 4) {
        return false;
    }

    const palette = getPaletteFromImageData({
        width: info.width,
        height: info.height,
        data: new Uint8ClampedArray(data.buffer),
    });
    let background = Color('#000000');
    if ( palette && palette.length > 2) {
        background = Color(palette[1]).lighten(0.4);
    }

    const path = `${os.tmpdir()}/${mandir.toLowerCase()}${index}.jpg`;
    const caption = (templeData && templeData[mandir]) ? templeData[mandir].caption || '' : '';

    return sharp(image).resize({
        width: 1080,
        height: 1920,
        fit: 'contain',
        position: 'center',
        background: background
    })
        .toFile(path)
        .then(() => ({
            path,
            caption
          }));
}

module.exports = getImages;
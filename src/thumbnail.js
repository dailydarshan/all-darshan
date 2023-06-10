const sharp = require('sharp');

async function createThumbnail( image, mandir, darshanDate ) {
    
    const dateImage = await getDateImage(darshanDate);

    let resizedImage = await sharp(image).resize({width:1080}).toBuffer();
    let left = 840;
    let { height } = await sharp(resizedImage).metadata();
    if(height > 1080) {
        resizedImage = await sharp(resizedImage).resize({height: 1080}).toBuffer();
        const { width } = await sharp(resizedImage).metadata();
        left = Math.floor( 840 + ( 540 - (width/2) ) );
        height = 1080;
    }
    let top = Math.floor( 540 - (height/2) );
    if( top < 0 ) {
        top = 0;
    }
    const path   = `./${mandir}-thumbnail.jpg`;
    const images = [
        {
            input: resizedImage,
            top,
            left
        },
        {
            input: `./thumbnails/${mandir}.png`,
            top: 0,
            left: 0
        }
    ];

    if (dateImage) {
        images.push(...dateImage);
    }
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

async function getDateImage(darshanDate) {
    try {
        const textArgs = {
            align: 'center',
            text: `<span foreground="#CF102F"><b>${darshanDate}</b></span>`,
            width: 600,
            height: 60,
            rgba: true
        };
        const textArgs2 = {
            ...textArgs,
            text: `<span foreground="white"><b>${darshanDate}</b></span>`,
        };
        const text = await sharp({text: textArgs}).png();
        const text2 = await sharp({text: textArgs2}).png();
        const textImage = await text.toBuffer();
        const textImage2 = await text2.toBuffer();
        
        return [{ 
            input: textImage,
            top: 840,
            left: 305,
        }, 
        { 
            input: textImage2,
            top: 835,
            left: 300,
        }];
    } catch (error) {
        console.log(error);
    }
}

async function getDateImageThumb(darshanDate) {
    try {
        const textArgs = {
            align: 'center',
            text: `<span foreground="#CF102F"><b>${darshanDate}</b></span>`,
            width: 800,
            height: 180,
            rgba: true
        };
        const textArgs2 = {
            ...textArgs,
            text: `<span foreground="white"><b>${darshanDate}</b></span>`,
        };
        const text = await sharp({text: textArgs}).png();
        const text2 = await sharp({text: textArgs2}).png();
        const textImage = await text.toBuffer();
        const textImage2 = await text2.toBuffer();
        
        return [{ 
            input: textImage,
            top: 900,
            left: 80,
        }, 
        { 
            input: textImage2,
            top: 895,
            left: 75,
        }];
    } catch (error) {
        console.log(error);
    }
}


async function createYoutubeThumbnail( darshanDate ) {
    
    const dateImage = await getDateImageThumb(darshanDate);
    const image = './thumbnail.jpg';

    const path   = `./youtube-thumbnail.jpg`;
    const images = [];

    if (dateImage) {
        images.push(...dateImage);
    }
    return sharp(image)
        .composite(images)
        .toFile(path)
        .then(() => path);

}

module.exports = {createThumbnail, createYoutubeThumbnail};
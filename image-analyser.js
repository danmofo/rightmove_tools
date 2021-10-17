/**
 * This will analyse images from a Rightmove property listing.
 *
 * todo: Save the images from listing instead of using static ones and write a CLI
 */

const gm = require('gm').subClass({imageMagick: true});
const imageToAscii = require('image-to-ascii');

const images = [
    './images/47229_101023000793_IMG_00_0000.jpeg',
    './images/47229_101023000793_IMG_02_0000.jpeg',
    './images/47229_101023000793_IMG_03_0000.jpeg',
    './images/47229_101023000793_IMG_04_0000.jpeg',
    './images/47229_101023000793_IMG_05_0000.jpeg'
];

images.forEach(image => {
    gm(image)
        .identify((err, data) => {
            if(err) {
                console.log(`Failed to identity image: ${image}`);
                return;
            }
            imageToAscii(image, {
                size: {
                    height: '50%'
                }
            },(err, converted) => {
                console.log(err || converted);
                console.log(`Path: ${image}, Date: ${getDateTakenFromProperties(data.Properties)}`);
            });
             
        });
});

function getDateTakenFromProperties(properties) {
    return properties['exif:DateTimeOriginal'] ||
           properties['date:create'];
}
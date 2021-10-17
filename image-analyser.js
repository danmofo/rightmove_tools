/**
 * This will analyse images from a Rightmove property listing.
 *
 * todo: Save the images from listing instead of using static ones and write a CLI
 */

const gm = require('gm').subClass({imageMagick: true});

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
            console.log(`Path: ${image}, Date: ${getDateTakenFromProperties(data.Properties)}`);
        });
});

function getDateTakenFromProperties(properties) {
    if(properties['exif:DateTimeOriginal']) {
        return properties['exif:DateTimeOriginal'];
    }
    return properties['date:create'];
}
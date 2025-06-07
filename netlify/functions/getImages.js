const fs = require('fs');
const path = require('path');

exports.handler = async () => {
    const dir = path.join(__dirname, '../../img');
    try {
        const files = fs.readdirSync(dir);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        return {
            statusCode: 200,
            body: JSON.stringify(imageFiles)
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to read images directory' })
        };
    }
};

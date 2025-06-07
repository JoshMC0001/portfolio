const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const form = new IncomingForm({ keepExtensions: true });
    form.uploadDir = '/tmp'; // temporary dir for Netlify

    return new Promise((resolve, reject) => {
        form.parse(event, async (err, fields, files) => {
            if (err) {
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'File parse error' }),
                });
            }

            const file = files.file;
            const originalFileName = file.originalFilename;
            const tempPath = file.filepath;

            const imgDir = path.resolve(__dirname, '../../img');
            const targetPath = path.join(imgDir, originalFileName);

            try {
                // Ensure img directory exists
                if (!fs.existsSync(imgDir)) {
                    fs.mkdirSync(imgDir, { recursive: true });
                }

                // Move file
                fs.renameSync(tempPath, targetPath);

                return resolve({
                    statusCode: 200,
                    body: JSON.stringify({ url: `/img/${originalFileName}` }),
                });
            } catch (moveErr) {
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to move file' }),
                });
            }
        });
    });
};

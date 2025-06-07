const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const imgDir = path.join(__dirname, '../../img');
    const files = fs.readdirSync(imgDir).filter(file =>
      /\.(png|jpe?g|gif|webp)$/i.test(file)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read image folder' }),
    };
  }
};

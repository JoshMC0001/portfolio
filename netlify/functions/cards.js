const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'cards.json');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    try {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return {
        statusCode: 200,
        body: data,
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to read data' }),
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      fs.writeFileSync(dataFilePath, event.body);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data saved successfully' }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to write data' }),
      };
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
};

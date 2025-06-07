// netlify/functions/cards.js
const fs = require('fs');
const path = require('path');

const CARDS_FILE = path.join(__dirname, 'cards.json');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'GET') {
    try {
      const data = fs.readFileSync(CARDS_FILE, 'utf-8');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      };
    } catch (err) {
      // If file doesn't exist, return empty array
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const cards = JSON.parse(event.body);
      fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2));
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Cards saved successfully' }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save cards' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

let cards = [];

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    // Return cards
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS if you test locally or from different origins
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cards),
    };
  }

  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body);
      if (!Array.isArray(data)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Data should be an array of cards" }),
        };
      }
      cards = data;
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Cards updated" }),
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON" }),
      };
    }
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};

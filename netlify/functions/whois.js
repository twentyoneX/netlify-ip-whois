const whois = require('whois');
const { promisify } = require('util');

// Convert the callback-based whois.lookup into a modern async/await function
const lookup = promisify(whois.lookup);

exports.handler = async function(event, context) {
  // Define headers that will be sent with every response.
  // This is crucial for allowing your Blogspot widget to access the API.
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/plain' // The widget expects plain text, not JSON
  };

  // Browsers send a pre-flight "OPTIONS" request to check permissions.
  // We must handle this correctly.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // "No Content" success status
      headers,
      body: ''
    };
  }

  // Get the IP or domain from the URL parameter '?q=...'
  const query = event.queryStringParameters.q;

  if (!query) {
    return {
      statusCode: 400, // Bad Request
      headers,
      body: 'Error: A required query parameter "q" is missing.'
    };
  }

  try {
    // Perform the actual WHOIS lookup
    const result = await lookup(query);

    // If successful, return the plain text result
    return {
      statusCode: 200, // OK
      headers,
      body: result
    };

  } catch (error) {
    console.error(`[WHOIS-ERROR] Lookup failed for query "${query}":`, error);
    
    // If an error occurs, return a user-friendly plain text error message
    return {
      statusCode: 500, // Internal Server Error
      headers,
      body: `Error: The WHOIS lookup failed for "${query}". This could be due to an invalid IP/domain or a temporary issue with the lookup service.`
    };
  }
};

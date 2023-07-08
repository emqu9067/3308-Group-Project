const http = require('http');

const port = 80;
const baseUrl = `http://localhost:${port}`;


const homePage = `<!DOCTYPE html>
   <html lang="en">
   <head>
      <meta charset="UTF-8">
      <title>My Main Page</title>
   </head>
   <body>
      <h1>My Main Page</h1>
   </body>
   </html>`;


http.createServer(function (req, response) {
   console.log(req);
   response.writeHead(200, {'Content-Type': 'text/html'});


   response.write(homePage);


   response.end();
}).listen(port, '0.0.0.0');
console.log('Server running at http://localhost:' + port);
importScripts('./worker.js');

router.get('/foo', function(request, response){
  let html = `
    <html>
      <head>
        <title>It worked!</title>
      </head>
      <body>
        <h1>Hello world!</h1>
      </body>
    </html>
  `;

  response.write(html);
  response.end();
});

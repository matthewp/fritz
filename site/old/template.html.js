
/* OLD

    <!doctype html>
    <html lang="en">
    <title>Fritz app</title>
    <meta charset="utf-8">
    
    <script>APP = new Worker('./app.js');</script>
    <script type="module" src="./window.js"></script>

    ${body}
*/

module.exports = function({ shim, body }) {
  return /* html */ `
    <!doctype html>
    <html lang="en">
    <meta charset="utf-8">
    <title>Fritz - Take your UI off the main thread</title>
    <link rel="modulepreload" href="./main.js">
    <script>APP = new Worker('./app.js');</script>
    <link rel="manifest" href="./manifest.json">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
    <meta name="theme-color" content="#58A4B0"/>
    <link rel="shortcut icon" href="/favicon.ico">
    <script>${shim}</script>
    <style>
      :root {
        --gray: #BAC1B8;
        --cadetblue: #58A4B0;
        --jet: #303030;
        --cyan: #0C7C59;
        --vermilion: #D64933; 
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: 'Open Sans', sans-serif;
        font-weight: 100;
        background-color: var(--gray);
        margin: 0;
      }
    </style>

    ${body}

    <!--<script type="module" src="./main.js"></script>-->
    <script>
      // Check that service workers are supported
      if ('serviceWorker' in navigator && location.port != 1931) {
        // Use the window load event to keep the page load performant
        window.addEventListener('load', async () => {
          let registrations = await navigator.serviceWorker.getRegistrations();

          for(let registration of registrations) {
            if(registration.active &&
              registration.active.scriptURL.includes('service-worker.js')) {

              registration.unregister();
            }
          }

          navigator.serviceWorker.register('./sw.js');
        });
      }
    </script>

    <noscript>
      <h1>Oops!</h1>
      <p>It looks like you have JavaScript turned off. Since this is a website about a JavaScript library there's no reason to have it off.</p>
    </noscript>
  `;
};

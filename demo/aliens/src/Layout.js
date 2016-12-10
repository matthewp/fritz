import { h } from 'cwf/worker.js';

export default function(props, children) {
  return <html>
    <head>
      <title>Aliens app!</title>
      <link rel="stylesheet" href="/styles.css"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
    </head>
    <body>
      <header></header>

      <main>
        <h1>Aliens</h1>

        <section>{children}</section>
      </main>
    </body>
  </html>
};

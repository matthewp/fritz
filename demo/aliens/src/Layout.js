import { h } from '../../../worker.js';

export default function(props, children) {
  return <html>
    <head>
      <title>Aliens app!</title>
      <link rel="stylesheet" href="./styles.css"/>
    </head>
    <body>
      <h1>Aliens</h1>

      <main>{children}</main>
    </body>
  </html>
};

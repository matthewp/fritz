import { h } from '../../../worker.js';

const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';

export default function(props, children) {
  let state = props.state;

  const scripts = !isNode ? '' : (
    <div>
      <script src="/cwf.js"></script>
      <script>
        {
          state ? `framework.state = ${JSON.stringify(state)};\n` : ''
        }
        framework.router = new Worker('/routes.js');
      </script>
    </div>
  );

  return <html>
    <head>
      <title>Aliens app!</title>
      <link rel="stylesheet" href="/styles.css"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
    </head>
    <body>
      <header></header>

      <main>
        <section>{children}</section>
      </main>
      {scripts}
    </body>
  </html>
};

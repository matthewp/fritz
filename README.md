# fritz

A really weird web worker framework.

```jsx
import fritz from 'fritz';
import Layout from './Layout.js';

const app = fritz();

app.use(() => app.state.count = app.state.count || 0);

app.get('/', function(req, res){
  const count = app.state.count;

  res.push(
    <Layout>
      <h1>Hello world!</h1>

      <form action="/click" method="POST">
        <button type="submit">Increment</button>
      </form>
      
      <strong>{count}<strong>
    </Layout>
  );
});

app.post('/click', function(req, res){
  app.state.count;

  res.push(
    <Layout>
      <h1>Hello world!</h1>

      <form action="/click" method="POST">
        <button type="submit">Increment</button>
      </form>
      
      <strong>{count}<strong>
    </Layout>
  );
});
```

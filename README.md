# fritz

A really weird web worker framework.

```jsx
import fritz from 'fritz';
import Layout from './Layout.js';

const app = fritz();

app.get('/', function(req, res){
  res.push(
    <Layout>
      <h1>Hello world!</h1>
    </Layout>
  )
});
```

import { h } from 'cwf/worker.js';
import Layout from './layout.js';

export default function(){
  const app = this;

  app.get('/article/:id',
  function(req, res){
    let id = req.params.id;

    res.push(
      <Layout>
        <div>It worked!</div>
        <span>id: {id}</span>
      </Layout>
    );
  });
}

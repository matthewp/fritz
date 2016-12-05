import { h } from '../../../worker.js';
import Layout from './Layout.js';

export default function(app){
  let species = [
    'xenomorph',
    'predator'
  ]

  app.get('/', function(req, res) {
    return <Layout>
      <form fritz-event="keyup" fritz-url="/search" fritz-method="GET">
        <input type="text" value="" name="q" placeholder="Search species"/>
      </form>
      <ul>
        {species.map(name => {
          return <li>{name}</li>
        })}
      </ul>
    </Layout>
  });
}


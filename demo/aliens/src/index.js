import { h } from 'cwf/worker.js';
import Layout from './Layout.js';
import SpeciesList from './SpeciesList.js';
import { details } from './api.js';

const ids = [
  1443, // xenomorph
  8459, // predator
  1758, // engineer
  1754, // facehugger
  11254 // predalien
];

export default function(){
  const app = this;

  function allSpecies(req, res, next) {
    if(!app.state.species) {
      details(ids).then(species => {
        app.state.species = species;
        next();
      });
      return;
    }
    next();
  }

  app.get('/',
  allSpecies,
  function(req, res) {
    let species = app.state.species;
    res.push(
      <Layout>
        <SpeciesList species={species}></SpeciesList>
      </Layout>
    );
  });

  app.get('/search',
  allSpecies,
  function(req, res){
    let query = req.url.searchParams.get('q');
    let species = app.state.species;

    res.push(
      <Layout>
        <SpeciesList species={species} filter={query}></SpeciesList>
      </Layout>
    );
  });
}


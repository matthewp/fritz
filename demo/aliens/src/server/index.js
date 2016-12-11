import { h } from '../../../../worker.js';
import Layout from '../Layout.js';
import Loading from '../Loading.js';
import SpeciesList from '../SpeciesList.js';

function index(species, state) {
  return (
    <Layout state={state}>
      <SpeciesList species={species}></SpeciesList>
    </Layout>
  );
}

function search(species, query, state) {
  return (
    <Layout state={state}>
      <SpeciesList species={species} filter={query}></SpeciesList>
    </Layout>
  );
}

function article(articleData, state) {
  let data = articleData;
  let intro = data.article.sections[0];

  return (
    <Layout state={state}>
      <h1>{intro.title}</h1>

      <article>
        {intro.content.map(content => {
          return <p>{content.text}</p>
        })}
      </article>
    </Layout>
  );
}

export {
  Layout,
  Loading,
  SpeciesList,
  index,
  search,
  article
}

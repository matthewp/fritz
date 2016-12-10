import { h } from 'cwf/worker.js';

function Specie({specie}) {
  let url = `/article/${specie.id}`;

  return (
    <li class="specie">
      <a href={url}>
        <figure>
          <img src={specie.thumbnail} />
        </figure>
        <span class="specie-title">{specie.title}</span>
      </a>
    </li>
  );
}

export default function({ filter, species }, children) {
  let items = filter ? filterSpecies(species, filter) : species;

  return (
    <div>
      <form action="/search" data-event="keyup" data-no-push>
        <input type="text" value="" name="q" placeholder="Search species" class="alien-search" />
      </form>
      <ul class="species">
        {items.map(specie => {
          return <Specie specie={specie}/>
        })}
      </ul>
    </div>
  );
}

function filterSpecies(species, query){
  query = query.toLowerCase();
  return species.filter(specie => specie.title.toLowerCase().indexOf(query) === 0);
}

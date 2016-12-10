export function details(ids) {
  return fetch(`/api/details/${ids.join(',')}`)
    .then(res => res.json())
    .then(data => {
      let species = Object.keys(data.items).map(id => data.items[id]);
      return species;
    });
}

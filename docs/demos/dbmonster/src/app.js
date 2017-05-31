import fritz, { Component, h } from '../../../../worker.js';

importScripts('https://cdn.rawgit.com/WebReflection/dbmonster/master/data.js');

const styles = ``;

function row(db) {
  var rows = [
    h('td', {'class': 'dbname'}, [db.name]),
    h('td', {class:'query-count'}, [
      h('span', {class:getCountClassName(db)}, [
        db.queries.length
      ])
    ])
  ].concat(db.topFiveQueries.map(db => (
    h('td', {'class': elapsedClassName(db.elapsed)}, [
      db.elapsed,
      h('div', {'class': 'popover left'}, [
        h('div', {'class': 'popover-content'}, [
          db.query
        ]),
        h('div', {'class': 'arrow'})
      ])
    ])
  )))

  return h('tr', rows);
}

class App extends Component {
  constructor() {
    super();

    this.dbs = getData();
    //this.updateOften();
  }

  updateOften() {
    setInterval(_ => {
      this.dbs = getData();
      this.update();
    }, 100);
  }

  render() {
    var dbs = this.dbs;

    return h('div', [
      h('style', [styles]),
      h('div', {'class':'table table-striped latest-data'}, [
        h('div', {'class': 'tbody'}, dbs.map(row))
      ])
    ])
  }
}

fritz.define('db-monster', App);

/*
	  <table class="table table-striped latest-data">
		<tbody>
		{{#each dbs}}
			<tr>
			  <td class="dbname">
				{{name}}
			  </td>
			  <td class="query-count">
				<span class="{{countClassName}}">
					{{queryCount}}
				</span>
			  </td>
			  {{#each topFiveQueries}}
				<td class="Query {{className}}">
					{{elapsed}}
				  <div class="popover left">
					<div class="popover-content">{{query}}</div>
					<div class="arrow"></div>
				  </div>
				</td>
			  {{/each}}
			</tr>
		  {{/each}}
		</tbody>
	  </table>
*/
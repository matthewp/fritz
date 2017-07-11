import fritz, { Component, h } from '../../../../worker.js';
import styles from './row.css';

function formatElapsed(value) {
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
    minutes = Math.floor(value / 60);
    comps = (value % 60).toFixed(2).split('.');
    seconds = comps[0].lpad('0', 2);
    ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}

class TableRow extends Component {
  static get props() {
    return {db: {}};
  }

  render({ db }) {
    var rows = [
      h('style', [styles]),
      h('div', {'className': 'table-cell dbname'}, [db.name]),
      h('div', {className:'table-cell query-count'}, [
        h('span', {className:getCountClassName(db)}, [
          db.queries.length
        ])
      ])
    ].concat(db.topFiveQueries.map(db => (
      h('div', {'className': 'table-cell ' + elapsedClassName(db.elapsed)}, [
        formatElapsed(db.elapsed),
        h('div', {'className': 'popover left'}, [
          h('div', {'className': 'popover-content'}, [
            db.query
          ]),
          h('div', {'className': 'arrow'})
        ])
      ])
    )))

    return h('div', {'className': 'row-container'}, rows);
  }
}

fritz.define('table-row', TableRow);
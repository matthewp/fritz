import fritz, { Component, h } from '../../../../worker.js';
import styles from './row.css';

class TableRow extends Component {
  static get props() {
    return {db: {}};
  }

  render({ db }) {
    var rows = [
      h('style', [styles]),
      h('div', {'class': 'table-cell dbname'}, [db.name]),
      h('div', {class:'table-cell query-count'}, [
        h('span', {class:getCountClassName(db)}, [
          db.queries.length
        ])
      ])
    ].concat(db.topFiveQueries.map(db => (
      h('div', {'class': 'table-cell ' + elapsedClassName(db.elapsed)}, [
        db.elapsed,
        h('div', {'class': 'popover left'}, [
          h('div', {'class': 'popover-content'}, [
            db.query
          ]),
          h('div', {'class': 'arrow'})
        ])
      ])
    )))

    return h('div', {'class': 'row-container'}, rows);
  }
}

fritz.define('table-row', TableRow);
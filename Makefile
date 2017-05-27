.PHONY: window worker watch site site-watch site-main site-dev all

all: worker window

worker:
	node_modules/.bin/rollup -o worker.umd.js -c rollup.config.js -f umd -n fritz src/worker/umd.js
	node_modules/.bin/rollup -o worker.js -c rollup.config.js -f es -n fritz src/worker/index.js

window:
	node_modules/.bin/rollup -o window.umd.js -c rollup.config.js -n fritz src/window/index.js
	node_modules/.bin/rollup -o window.js -c rollup.config.js -f es -n fritz src/window/index.js

serve:
	http-server -p 8008

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch

site:
	node_modules/.bin/rollup -o docs/app.js -c docs/rollup.config.js -f iife docs/src/app.js

site-main:
	node_modules/.bin/rollup -o docs/main.js -c docs/rollup.config.js -f iife docs/src/main.js

site-watch:
	find docs/src -name "*.*" | entr make site

site-dev:
	make serve & make site-watch
.PHONY: window worker watch compile-skate all

all: compile-skate worker window

compile-skate:
	node_modules/.bin/babel node_modules/skatejs/src --out-dir node_modules/skatejs/out

worker:
	node_modules/.bin/rollup -o worker.umd.js -c rollup.config.js -f umd -n fritz src/worker/umd.js
	node_modules/.bin/rollup -o worker.js -c rollup.config.js -f es -n fritz src/worker/index.js

window:
	node_modules/.bin/rollup -o window.js -c rollup.config.js -n fritz src/window/index.js

serve:
	http-server -p 8008

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch
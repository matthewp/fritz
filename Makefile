.PHONY: window worker watch all

worker:
	node_modules/.bin/rollup -o worker.js -f umd -n framework src/worker/index.js

window:
	node_modules/.bin/rollup -o window.js -c rollup.config.js -n framework src/window/index.js

all: worker window

watch:
	find src -name "*.js" | entr make all

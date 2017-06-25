.PHONY: all window worker watch

ROLLUP=node_modules/.bin/rollup

all: worker window

worker:
	$(ROLLUP) -o worker.umd.js -c rollup.config.js -f umd -n fritz src/worker/umd.js
	$(ROLLUP) -o worker.js -c rollup.config.js -f es -n fritz src/worker/index.js

window:
	$(ROLLUP) -o window.umd.js -c rollup.config.js -n fritz src/window/index.js
	$(ROLLUP) -o window.js -c rollup.config.js -f es -n fritz src/window/index.js

serve:
	http-server -p 8008

watch:
	find src -name "*.js" | entr make all

dev:
	make serve & make watch

include docs/site.mk
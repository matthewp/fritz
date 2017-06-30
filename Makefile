.PHONY: all window worker watch

ROLLUP=node_modules/.bin/rollup

all: worker window

# Build the worker
worker:
	$(ROLLUP) -o worker.umd.js -c rollup.config.js -f umd -n fritz src/worker/umd.js
	$(ROLLUP) -o worker.js -c rollup.config.js -f es -n fritz src/worker/index.js

# Build the window module
window:
	$(ROLLUP) -o window.umd.js -c rollup.config.js -n fritz src/window/index.js
	$(ROLLUP) -o window.js -c rollup.config.js -f es -n fritz src/window/index.js

# Serve the current directory (port 8008)
serve:
	http-server -p 8008

# Watch for file changes and rerun `worker` and `window`
watch:
	find src -name "*.js" | entr make all

# Run `serve` and `watch`
dev:
	make serve & make watch

include docs/site.mk
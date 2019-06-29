# Compiler
COMPILE = node_modules/.bin/compile

# Source files
SRCES := $(shell find src -name '*.js')

all: worker window.js
.PHONY: all

worker.js: $(SRCES)
	$(ROLLUP) -o worker.js -c rollup.config.js -f es -n fritz src/worker/index.js

worker.umd.js: $(SRCES)
	$(ROLLUP) -o $@ -c rollup.config.js -f umd -n fritz src/worker/umd.js

# Build the worker modules
worker: worker.js worker.umd.js
.PHONY: worker

window.js: $(SRCES)
	$(ROLLUP) -o $@ -c rollup.config.js -f es -n fritz src/window/index.js

# Serve the current directory (port 8008)
serve:
	http-server -p 8008
.PHONY: serve

# Watch for file changes and rerun `worker` and `window`
watch:
	find src -name "*.js" | entr make all
.PHONY: watch

# Run `serve` and `watch`
dev:
	make serve & make watch
.PHONY: dev

include docs/site.mk

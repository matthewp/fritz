# Compiler
COMPILE = node_modules/.bin/compile

# Source files
SRCES := $(shell find src -name '*.js')

all: worker.js worker.umd.js window.js
.PHONY: all

worker.js: $(SRCES)
	$(COMPILE) -o $@ -f es src/worker/index.js

worker.umd.js: $(SRCES)
	$(COMPILE) -o $@ -f umd -n fritz --exports default src/worker/umd.js

window.js: $(SRCES)
	$(COMPILE) -o $@ -f es src/window/index.js

# Clean
clean:
	@rm -f worker.js worker.umd.js window.js
.PHONY: clean

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

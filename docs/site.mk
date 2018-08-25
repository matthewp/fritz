cur_dir := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

SW=./node_modules/.bin/sw-precache

site: site-worker site-main
.PHONY: site

# Build the site's worker module
site-worker:
	$(ROLLUP) -o docs/app.js -c docs/rollup.config.js -f iife docs/src/app.js
.PHONY: site-worker

site-main:
	$(ROLLUP) -o docs/main.js -c docs/rollup.config.js -f iife docs/src/main.js
.PHONY: site-main

site-watch:
	find docs/src -name "*.*" | entr make site
.PHONY: site-watch

site-dev:
	make serve & make site-watch
.PHONY: site-dev

site-sw:
	$(SW) --root=docs --static-file-globs='docs/*({app,main,service-worker-registration}.js|index.html|*.{png,webp})'
.PHONY: site-sw

site-release: site site-sw
.PHONY: site-release

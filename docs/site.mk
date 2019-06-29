.PHONY: site site-watch site-worker site-main site-dev site-sw site-release

cur_dir := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

SW=./node_modules/.bin/sw-precache

site: site-worker site-main

# Build the site's worker module
site-worker:
	$(ROLLUP) -o docs/app.js -c docs/rollup.config.js -f iife docs/src/app.js

site-main:
	$(ROLLUP) -o docs/main.js -c docs/rollup.config.js -f iife docs/src/main.js

site-watch:
	find docs/src -name "*.*" | entr make site

site-dev:
	make serve & make site-watch

site-sw:
	$(SW) --root=docs --static-file-globs='docs/*({app,main,service-worker-registration}.js|index.html|*.{png,webp})'

site-release: site site-sw
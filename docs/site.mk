
cur_dir := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
DOC_SRCES := $(shell find docs/src -name '*.js')

SW=./node_modules/.bin/sw-precache

site: docs/app.js docs/main.js
.PHONY: site

# Build the site's worker module
docs/app.js: $(DOC_SRCES)
	$(COMPILE) -f iife -o $@ --string css docs/src/app.js

docs/main.js: $(DOC_SRCES)
	$(COMPILE) -f es -o $@ --string css docs/src/main.js

# Tasks
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
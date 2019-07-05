
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

docs/prerender.js: $(DOC_SRCES)
	$(COMPILE) -f umd -o $@ --string css docs/scripts/render.js

docs/sw.js:
	workbox generateSW workbox-config.js

# Tasks
site-watch:
	find docs/src -name "*.*" | entr make site
.PHONY: site-watch

site-dev:
	make serve & make site-watch
.PHONY: site-dev

site-release: site site-sw
.PHONY: site-release

deploy:
	aws s3 sync docs s3://fritz.work --delete
.PHONY: deploy
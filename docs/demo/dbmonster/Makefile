
app:
	../../../node_modules/.bin/rollup -c rollup.config.js -f iife -o app.js src/app.js
.PHONY: app

watch:
	find src -name "*.js" | entr make
.PHONY: watch

serve:
	cd ../../../
	http-server -p 8099
.PHONY: serve

dev:
	make watch & make serve
.PHONY: dev
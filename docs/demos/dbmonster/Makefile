.PHONY: app watch serve

app:
	../../../node_modules/.bin/rollup -c rollup.config.js -f iife -o app.js src/app.js

watch:
	find src -name "*.js" | entr make

serve:
	cd ../../../
	http-server -p 8099

dev:
	make watch & make serve
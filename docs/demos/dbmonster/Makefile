.PHONY: app

app:
	../../../node_modules/.bin/rollup -c rollup.config.js -f iife -o app.js src/app.js

watch:
	find src -name "*.js" | entr make

.PHONY: app watch

app:
	./node_modules/.bin/rollup -c rollup.config.js -o routes.js src/routes.js

watch:
	find src -name "*.js" | entr make app

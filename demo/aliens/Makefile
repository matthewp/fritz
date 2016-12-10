.PHONY: app watch serve link

app:
	./node_modules/.bin/rollup -c rollup.config.js -o routes.js src/routes.js

serve:
	node server/index.js

link:
	mkdir -p node_modules/cwf
	cd node_modules/cwf
	ln -s ../../../../worker.js worker.js
	ln -s ../../../../window.js window.js

watch:
	find src -name "*.js" | entr make app

dev:
	make serve & make watch

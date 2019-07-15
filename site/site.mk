site/public/sw.js:
	workbox generateSW workbox-config.js

deploy:
	aws s3 sync site/public s3://fritz.work --delete
.PHONY: deploy
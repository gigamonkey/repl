files := index.html
files += style.css
files += $(wildcard *.png)
files += $(wildcard *.woff2)
files += js

pretty:
	prettier -w *.js
	tidy -i -w 120 -m --gnu-emacs yes --quiet yes --warn-proprietary-attributes no *.html
	cp style.css style.css~; ./node_modules/cssbeautify/bin/cssbeautify style.css~ > style.css

serve:
	./node_modules/.bin/esbuild web.js --servedir=. --outdir=./js --bundle --sourcemap

build:
	./node_modules/.bin/esbuild web.js --outdir=./js --bundle --sourcemap

publish: build
	./publish.sh $(files)

clean:
	rm -rf ./js
	find . -name '*~' -delete

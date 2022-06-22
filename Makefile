files := $(wildcard *.html)
files += $(wildcard *.css)
files += $(wildcard *.png)
files += $(wildcard *.woff2)
files += js

cssbeautify := ./node_modules/.bin/cssbeautify

esbuild := ./node_modules/.bin/esbuild
esbuild_opts := --outdir=./js --bundle --sourcemap


worker_entry_points := vs/language/json/json.worker.js
worker_entry_points += vs/language/css/css.worker.js
worker_entry_points += vs/language/html/html.worker.js
worker_entry_points += vs/language/typescript/ts.worker.js
worker_entry_points += vs/editor/editor.worker.js

all: build

js/%.js: ./node_modules/monaco-editor/esm/%.js
	$(esbuild) $< $(esbuild_opts) --outbase=./node_modules/monaco-editor/esm/

js/web.js: web.js
	$(esbuild) web.js $(esbuild_opts) --loader:.ttf=file

pretty:
	prettier -w *.js
	tidy -i -w 120 -m --gnu-emacs yes --quiet yes --warn-proprietary-attributes no --sort-attributes alpha *.html
	cp style.css style.css~; $(cssbeautify) style.css~ > style.css

serve:
	$(esbuild) web.js $(esbuild_opts) --servedir=.

build: js/web.js $(addprefix js/, $(worker_entry_points))

publish: build
	./publish.sh $(files)

clean:
	rm -rf ./js
	find . -name '*~' -delete

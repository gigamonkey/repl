files := $(wildcard *.html)
files += $(wildcard *.css)
files += $(wildcard *.png)
files += $(wildcard *.woff2)
files += js

esbuild := ./node_modules/.bin/esbuild
esbuild_opts := --bundle
esbuild_opts += --loader:.ttf=file
esbuild_opts += --minify
esbuild_opts += --outdir=./js
esbuild_opts += --sourcemap

worker_entry_points := vs/language/json/json.worker.js
worker_entry_points += vs/language/css/css.worker.js
worker_entry_points += vs/language/html/html.worker.js
worker_entry_points += vs/language/typescript/ts.worker.js
worker_entry_points += vs/editor/editor.worker.js

all: js/web.js $(addprefix js/, $(worker_entry_points))

setup:
	npm install

js/%.js: ./node_modules/monaco-editor/esm/%.js
	$(esbuild) $< $(esbuild_opts) --outbase=./node_modules/monaco-editor/esm/

js/web.js: web.js
	$(esbuild) web.js $(esbuild_opts)

pretty:
	prettier -w *.js *.css
	tidy -config .tidyconfig *.html

serve:
	$(esbuild) web.js $(esbuild_opts) --servedir=.

publish: all
	./publish.sh $(files)

clean:
	rm -rf ./js
	find . -name '*~' -delete

pristine:
	git clean -fdx


.PHONY: setup pretty serve publish clean pristine

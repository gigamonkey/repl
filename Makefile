files := $(wildcard *.html)
files += $(wildcard *.css)
files += $(wildcard *.png)
files += $(wildcard *.woff2)
files += js

cssbeautify := ./node_modules/.bin/cssbeautify

esbuild := ./node_modules/.bin/esbuild
esbuild_opts := --outdir=./js
esbuild_opts += --bundle
esbuild_opts += --sourcemap
esbuild_opts += --loader:.ttf=file

tidy_opts := -i
tidy_opts += -w 120
tidy_opts += -m
tidy_opts += --gnu-emacs yes
tidy_opts += --quiet yes
tidy_opts += --warn-proprietary-attributes no
tidy_opts += --sort-attributes alpha

worker_entry_points := vs/language/json/json.worker.js
worker_entry_points += vs/language/css/css.worker.js
worker_entry_points += vs/language/html/html.worker.js
worker_entry_points += vs/language/typescript/ts.worker.js
worker_entry_points += vs/editor/editor.worker.js

all: build

setup:
	npm install

js/%.js: ./node_modules/monaco-editor/esm/%.js
	$(esbuild) $< $(esbuild_opts) --outbase=./node_modules/monaco-editor/esm/

js/web.js: web.js
	$(esbuild) web.js $(esbuild_opts)

pretty:
	prettier -w *.js
	tidy $(tidy_opts) *.html
	cp style.css style.css~; $(cssbeautify) style.css~ > style.css

serve:
	$(esbuild) web.js $(esbuild_opts) --servedir=.

build: js/web.js $(addprefix js/, $(worker_entry_points))

publish: build
	./publish.sh $(files)

clean:
	rm -rf ./js
	find . -name '*~' -delete

pristine:
	git clean -fdx

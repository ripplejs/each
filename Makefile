
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

test: build
	mocha-phantomjs test/unit/index.html

standalone:
	component build --standalone ripple-each --name standalone
	-rm -r dist
	mkdir dist
	sed 's/this\[\"ripple-each\"\]/this.ripple.each/g' build/standalone.js > dist/ripple-each.js
	rm build/standalone.js
	minify dist/ripple-each.js dist/ripple-each.min.js

.PHONY: clean test standalone

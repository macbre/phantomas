PHANTOMJS = /usr/bin/env phantomjs

test:
	@$(PHANTOMJS) support/mocha.js

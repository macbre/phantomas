# How to contribute

First of all: thanks for contributing to phantomas!

# Making changes

Please fork from ``devel`` branch when proposing changes to phantomas.

* use JavaScript strict mode (add ``'use strict'`` at the top of the file)
* follow JSHint guidelines
* write / update unit tests when necessary
* update README.md when necessary
* make sure the code validates (``npm run-script lint``) and unit tests pass (``npm test``)
* register new dependencies in ``package.json`` (``npm install --save ...`` will be happy to assist you)
* use tabs for indentations
* make a pull request

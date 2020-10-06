# How to contribute

First of all: thanks for contributing to phantomas!

# Making changes

Please fork from ``devel`` branch when proposing changes to phantomas.

* use JavaScript strict mode (add ``'use strict'`` at the top of the file)
* follow JSHint guidelines
* write / update unit tests when necessary
* update README.md when necessary
* make sure the code lints (``npm run lint``), validates (``npm run lint``) and unit tests pass (``./test/server-start.sh`` and ``npm test``)
* register new dependencies in ``package.json`` (``npm install --save ...`` will be happy to assist you)
* make a pull request
* CI checks will validate and test your code automatically

## Adding a metric

* register a metric using ``phantomas.setMetric('fooName')`` at the top of the module to keep metrics in the same order between runs
* consider adding offenders to give more details (``phantomas.addOffender('fooName', assetURL)``)
* run ``npm run metadata`` script to regenerate JSON with metrics metadata
* update README.md

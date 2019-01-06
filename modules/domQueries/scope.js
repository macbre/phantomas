(function(phantomas) {
    phantomas.log('domQueries: initializing page scope code');

    function querySpy(type, query, fnName, context, hasNoResults) {
        phantomas.emit('domQuery', type, query, fnName, context, hasNoResults); // @desc DOM query has been made

        phantomas.log('querySpy: ' + query);
    }

    // selectors by element ID
    phantomas.spy(Document.prototype, 'getElementById', function(results, id) {
        phantomas.incrMetric('DOMqueriesById');
        phantomas.addOffender('DOMqueriesById', '#%s (in %s)', id, '#document');
        querySpy('id', '#' + id, 'getElementById', '#document', (results === null));
    }, true);

    // selectors by class name
    function selectorClassNameSpy(results, className) {
        /* jshint validthis: true */
        var context = phantomas.getDOMPath(this);

        phantomas.incrMetric('DOMqueriesByClassName');
        phantomas.addOffender('DOMqueriesByClassName', '.%s (in %s)', className, context);
        querySpy('class', '.' + className, 'getElementsByClassName', context, (results.length === 0));
    }

    phantomas.spy(Document.prototype, 'getElementsByClassName', selectorClassNameSpy, true);
    phantomas.spy(Element.prototype, 'getElementsByClassName', selectorClassNameSpy, true);

    // selectors by tag name
    function selectorTagNameSpy(results, tagName) {
        /* jshint validthis: true */
        var context = phantomas.getDOMPath(this);

        // querying by BODY and body is the same (issue #419)
        tagName = tagName.toLowerCase();

        phantomas.incrMetric('DOMqueriesByTagName');
        phantomas.addOffender('DOMqueriesByTagName', '%s (in %s)', tagName, context);
        querySpy('tag name', tagName, 'getElementsByTagName', context, (results.length === 0));
    }

    phantomas.spy(Document.prototype, 'getElementsByTagName', selectorTagNameSpy, true);
    phantomas.spy(Element.prototype, 'getElementsByTagName', selectorTagNameSpy, true);

    // selector queries
    function selectorQuerySpy(results, selector) {
        /* jshint validthis: true */
        var context = phantomas.getDOMPath(this);

        phantomas.incrMetric('DOMqueriesByQuerySelectorAll');
        phantomas.addOffender('DOMqueriesByQuerySelectorAll', '%s (in %s)', selector, context);
        querySpy('selector', selector, 'querySelectorAll', context, (results === null || results.length === 0));
    }

    phantomas.spy(Document.prototype, 'querySelector', selectorQuerySpy, true);
    phantomas.spy(Document.prototype, 'querySelectorAll', selectorQuerySpy, true);
    phantomas.spy(Element.prototype, 'querySelector', selectorQuerySpy, true);
    phantomas.spy(Element.prototype, 'querySelectorAll', selectorQuerySpy, true);

    // count DOM inserts
    function appendSpy(child) {
        /* jshint validthis: true */
        // ignore appending to the node that's not yet added to DOM tree
        if (!this.parentNode) {
            return;
        }

        var destNodePath = phantomas.getDOMPath(this),
            appendedNodePath = phantomas.getDOMPath(child);

        // skip undefined nodes (issue #560)
        if (destNodePath === false) {
            return;
        }

        // don't count elements added to fragments as a DOM inserts (issue #350)
        // DocumentFragment > div[0]
        if (destNodePath.indexOf('DocumentFragment') === 0) {
            return;
        }

        phantomas.incrMetric('DOMinserts');
        phantomas.addOffender('DOMinserts', '"%s" appended to "%s"', appendedNodePath, destNodePath);

        phantomas.log('DOM insert: node "%s" appended to "%s"', appendedNodePath, destNodePath);
    }

    phantomas.spy(Node.prototype, 'appendChild', appendSpy);
    phantomas.spy(Node.prototype, 'insertBefore', appendSpy);

    phantomas.log('domQueries: page scope code initialized');
})(window.__phantomas);

(function(phantomas) {

    // duplicated ID (issue #392)
    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM fully loaded and parsed");

        phantomas.spyEnabled(false, 'counting nodes with id');
        const nodes = document.querySelectorAll('*[id]'),
            ids = Array.prototype.slice.apply(nodes).map((node) => node.id);
        phantomas.spyEnabled(true);

        phantomas.emit('DOMids', ids);
    });

})(window.__phantomas);

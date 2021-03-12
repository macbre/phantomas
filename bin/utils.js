const decamelize = require("decamelize");

function decamelizeOptions(options) {
  // decamelize option names as returned by commander (see issue #863)
  let decamelized = {};

  for (const [key, value] of Object.entries(options)) {
    decamelized[decamelize(key, { separator: "-" })] = value;
  }

  return decamelized;
}

module.exports = {
  decamelizeOptions,
};

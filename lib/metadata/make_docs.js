/**
 * Generates Markdown files in /docs directory
 */
const debug = require("debug")("docs"),
  phantomas = require("../.."),
  fs = require("fs"),
  metadata_file = __dirname + "/metadata.json",
  docs_dir = fs.realpathSync(__dirname + "/../../docs"),
  github_root = "https://github.com/macbre/phantomas/tree/devel";

debug("Generating docs into %s ...", docs_dir);
debug("Reading %s ...", metadata_file);

const metadata = JSON.parse(fs.readFileSync(metadata_file));

// console.log(metadata);

const docs_notice =
  "\n\n---\n> This file is auto-generated from code comments. Please run `npm run make-docs` to update it.";

/**
 * events.md
 *
 * https://github.com/macbre/phantomas/issues/729
 */
var events = `
Events
======

`;

Object.keys(metadata.events)
  .sort()
  .forEach((eventName) => {
    const entry = metadata.events[eventName];

    events += `
### ${eventName}

**Description**: ${entry.desc}

**Arguments**: ${entry.arguments}

[View source](${github_root}${entry.file})

`.trim();

    events += "\n\n\n";
  });

async function buildDocs() {
  // now add some real life examples from loading an example URL from our tests
  events += `## Examples`;

  const promise = phantomas("http://0.0.0.0:8888/_make_docs.html");
  var hasEvent = {};

  [
    "recv",
    "send",
    "request",
    "response",
    "milestone",
    "metrics",
    "consoleLog",
    "jserror",
  ].forEach((eventName) => {
    promise.on(eventName, (...args) => {
      if (hasEvent[eventName]) return;
      hasEvent[eventName] = true;

      const dumped = JSON.stringify(args, null, "  ");
      debug("events.md: %s event triggered ...", eventName);

      events += `

### ${eventName}

Arguments passed to the event:

\`\`\`json
${dumped}
\`\`\`
    `.trimRight();
    });
  });

  // make results available when generating metrics.md - see the next step
  const runResults = await promise;

  debug("Report metrics: %j", runResults.getMetrics());
  debug("Report offenders: %j", runResults.getAllOffenders());

  debug("Saving events.md ...");
  fs.writeFileSync(docs_dir + "/events.md", events.trim() + docs_notice);

  /**
   * metrics.md
   *
   * https://github.com/macbre/phantomas/issues/729
   */

  // get offender examples from integration-spec.yaml
  const offenders = (() => {
    const yaml = require("js-yaml"),
      spec = yaml.safeLoad(
        fs
          .readFileSync(__dirname + "/../../test/integration-spec.yaml")
          .toString()
      );

    var offenders = {};

    spec.forEach((testCase) => {
      Object.keys(testCase.offenders || {}).forEach((metricName) => {
        if (!offenders[metricName]) {
          offenders[metricName] = testCase.offenders[metricName][0];
        }
      });
    });

    // test coverage is not 100%, fill missing offenders using the "real" phantomas run from above
    Object.keys(runResults.getMetrics()).forEach((metricName) => {
      if (!offenders[metricName] && runResults.getOffenders(metricName)) {
        offenders[metricName] = runResults.getOffenders(metricName)[0];
      }
    });

    return offenders;
  })();

  // build Markdown file
  var metrics = `
Modules and metrics
===================

This file describes all [\`phantomas\` modules](https://github.com/macbre/phantomas/tree/devel/modules) (${metadata.modulesCount} of them) and ${metadata.metricsCount} metrics that they emit.

When applicable, [offender](https://github.com/macbre/phantomas/issues/140) example is provided.

`;

  Object.keys(metadata.modules)
    .sort()
    .forEach((moduleName) => {
      const entry = metadata.modules[moduleName];

      metrics += `

## [${moduleName}](${github_root}${entry.file})

> ${entry.desc}
`;

      entry.metrics.sort().forEach((metricName) => {
        const metric = metadata.metrics[metricName],
          hasOffenders = metric.offenders ? ", with offenders" : "";

        metrics += `
##### \`${metricName}\`

${metric.desc} (${metric.unit}${hasOffenders})
`;

        // add offender's example
        if (hasOffenders && offenders[metricName]) {
          const dumped = JSON.stringify(offenders[metricName], null, "  ");

          metrics += `
\`\`\`json
${dumped}
\`\`\`
`;
        }
      });
    });

  debug("Saving metrics.md ...");
  fs.writeFileSync(docs_dir + "/metrics.md", metrics.trim() + docs_notice);

  // ---
  debug("Done");
}

buildDocs();

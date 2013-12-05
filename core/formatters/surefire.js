/*TODO: Figure out how to parse from the results:
 *			- Test properties
 *			- Timings
 *			- Errors
 */
/**
 * Results formatter for --format=surefire
 */
module.exports = function (results) {

    var parseResults = function (results) {
        var metrics = results.getMetricsNames(),
            testSuite = {
                name: results.getUrl(),
                failedCount: 0,
                skippedCount: 0,
                totalCount: metrics.length,
                tests: []
            };

        metrics.forEach(function (metric) {
            var testWasSkipped = !results.hasAssertion(metric),
                testFailed = !results.assert(metric),
                test = {
                    name: metric
                };

            if (testWasSkipped) {
                test.hasBeenRun = false;
                testSuite.skippedCount++;

            } else if (testFailed) {
                testSuite.failedCount++;
                test.isOk = false;
                test.expectedResult = results.getAssertion(metric);
                test.actualResult = results.getMetric(metric);
            }

            testSuite.tests.push(test);
        });
        return testSuite;
    };


    var parseProperties = function (results) {
        return [{name: "version", value: results.getGenerator()}];
    }

    var formattedResults = function (testSuite, properties) {
        var outputLines = [],
            NEW_LINE = '\n',
            TESTSUITE = {
                xml: '<?xml version="1.0" encoding="UTF-8" ?>',
                startTag: function (failed, skipped, total, name) {
                    return '<testsuite failures="' + failed + '" time="0" errors="0" skipped="' +
                        skipped + '" tests="' + total + '" name="' + name + '">';
                },
                endTag: '</testsuite>'
            },
            TESTCASE = {
                startTag: function (test) {
                    var startTag = '\t<testcase time="0" classname="phantomas.asserts" name="' + test.name + '"';
                    startTag += (test.isOk && test.hasBeenRun) ? '/>' : '>';
                    return startTag;
                },
                endTag: '\t</testcase>'
            },
            FAILURE = {
                startTag: '\t\t<failure type="phantomas.asserts.AssertionFailedError">',
                endTag: '\t\t</failure>',
                message: function (name, expected, actual) {
                    return '\t\t\tExpected value for ' + name + ' to be "' + expected + '", but was "' + actual + '".';
                }
            },
            PROPERTIES = {
                startTag: '\t<properties>',
                endTag: '\t</properties>',
                node: function (name, value) {
                    return '\t\t<property name="' + name + '" value="' + value + '"/>\n\t'
                }
            },
            SKIPPED = '\t\t<skipped/>';
            
        outputLines.push(TESTSUITE.xml);
        outputLines.push(TESTSUITE.startTag(testSuite.failedCount, testSuite.skippedCount,
            testSuite.totalCount, testSuite.name));

        if (properties.length > 0) {
            outputLines.push(PROPERTIES.startTag);
            properties.forEach(function (property) {
                outputLines.push(PROPERTIES.node(property.name, property.value));
            });
            outputLines.push(PROPERTIES.endTag);
            outputLines.push();
        }

        testSuite.tests.forEach(function (test) {
            outputLines.push(TESTCASE.startTag(test));

            if (test.expectedResult && test.actualResult) {
                outputLines.push(FAILURE.startTag);
                outputLines.push(FAILURE.message(test.name, test.expectedResult, test.actualResult));
                outputLines.push(FAILURE.endTag);
                outputLines.push(TESTCASE.endTag);

            } else if (!test.hasBeenRun) {
                outputLines.push(SKIPPED);
                outputLines.push(TESTCASE.endTag);
            }
        });
        outputLines.push(TESTSUITE.endTag);
        return outputLines.join(NEW_LINE).trim();
    }

    // public API
    return {

        render: function () {
            var testSuite = parseResults(results),
                properties = parseProperties(results);

            return formattedResults(testSuite, properties);
        }
    };
};
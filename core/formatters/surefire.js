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
            }

        metrics.forEach(function (metric) {
            var test = {
                name: metric
            };

            // check asserts
            if (results.hasAssertion(metric)) {
                if (!results.assert(metric)) {
                    testSuite.failedCount++;
                    test.isOk = false;
                    test.expectedResult = results.getAssertion(metric);
                    test.actualResult = results.getMetric(metric);
                }
            } else {
                // mark metrics with no assertions as skipped
                test.hasBeenRun = false;
                testSuite.skippedCount++;
            }

            testSuite.tests.push(test);
        });
        return testSuite;
    };


    var parseProperties = function (results) {
        return [];
    }

    var formattedResults = function (testSuite, properties) {
        var outputLines = [];
        outputLines.push('<?xml version="1.0" encoding="UTF-8" ?>');
        outputLines.push(['<testsuite',
								'failures="' + testSuite.failedCount + '"',
								'time="0"',
								'errors="0"',
								'skipped="' + testSuite.skippedCount + '"',
								'tests="' + testSuite.totalCount + '"',
								'name="' + testSuite.name + '"',
        				'>'].join(' '));

        if (properties.length > 0) {
            outputLines.push('\t<properties>');
            properties.forEach(function (property) {
                outputLines.push('\t\t<property name="' + property.name + '" value="' + property.value + '"/>\n\t');
            });
            outputLines.push('\t</properties>');
        }

        testSuite.tests.forEach(function (test) {
            outputLines.push(['\t<testcase',
                				'time="0"',
				                'classname="phantomas.asserts"',
                				'name="' + test.name + '"',
				                (test.isOk && test.hasBeenRun) 
				                	? '/>' 
				                	: '>',].join(' '));

            if (test.expectedResult && test.actualResult) {
                outputLines.push('\t\t<failure type="phantomas.asserts.AssertionFailedError">');
                outputLines.push('\t\t\tExpected value for ' + test.name + ' to be "' + test.expectedResult + '", but was "' + test.actualResult + '".');
                outputLines.push('\t\t</failure>');
                outputLines.push('\t</testcase>');

            } else if (!test.hasBeenRun) {
                outputLines.push('\t\t<skipped/>');
                outputLines.push('\t</testcase>');
            }
        });
        outputLines.push('</testsuite>');
        return outputLines.join('\n').trim();
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
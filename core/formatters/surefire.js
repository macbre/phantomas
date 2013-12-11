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
                test.hasBeenSkipped = true;
                testSuite.skippedCount++;

            } else if (testFailed) {
                testSuite.failedCount++;
                test.hasFailed = true;
                test.expectedResult = results.getAssertion(metric);
                test.actualResult = results.getMetric(metric);
            }

            testSuite.tests.push(test);
        });
        return testSuite;
    };


    var getProperties = function (results) {
        return [{name: "version", value: results.getGenerator()}];
    };

    var formattedResults = function (testSuite, properties) {
		var xmlBuilder = require('xmlbuilder');
		var testSuiteNode = xmlBuilder.create('testsuite', {version: '1.0', encoding: 'UTF-8'})
					.att('name', testSuite.name)
					.att('time', 0)
					.att('tests', testSuite.totalCount)
					.att('failures', testSuite.failedCount)
					.att('errors', 0)	
					.att('skipped', testSuite.skippedCount);
						
		if (properties.length > 0) {
			var propertiesNode = testSuiteNode.ele('properties');
			
			properties.forEach(function (property) {
				propertiesNode.ele('property', {
					'name': property.name,
					'value': property.value
				});
            });
		}	
		
		testSuite.tests.forEach(function (test) {
		
			var testCaseNode = testSuiteNode.ele('testcase', {
				'time': 0,
				'classname': 'phantomas.asserts',
				'name': test.name
			});

            if (test.hasFailed) {
                testCaseNode.ele('failure', {
                    'type': 'phantomas.asserts.AssertionFailedError',
                    'message': 'Expected value for ' + test.name + 
                               ' to be ' + test.expectedResult + ',' + 
                               ' but was ' + test.actualResult + '.'
                });
                
            } else if (test.hasBeenSkipped) {
                testCaseNode.ele('skipped');
            }
        });
		
		return testSuiteNode.end({
				pretty: true, 
				indent: '    ', 
				newline: '\n' 
			});
    };

    // public API
    return {
        render: function () {
            var testSuite = parseResults(results),
                properties = getProperties(results);

            return formattedResults(testSuite, properties);
        }
    };
};

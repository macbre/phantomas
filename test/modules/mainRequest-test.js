/**
 * Tests mainRequest module
 */
var vows = require('vows'),
    assert = require('assert'),
    mock = require('./mock');

vows.describe('mainRequest').
    addBatch({
        'redirect request': {
            topic: function () {
                return mock.initModule('mainRequest').
                    recv({}, {status: 301}).
                    responseEnd({}, {status: 200}).
                    report();
            },
            'contains all status codes in the trail': function (topic) {
                var metric = topic.getMetric('statusCodesTrail');
                assert.deepEqual(metric, [301, 200]);
            }
        },
        'long redirect request': {
            topic: function () {
                return mock.initModule('mainRequest').
                    recv({}, {status: 301}).
                    recv({}, {status: 302}).
                    responseEnd({}, {status: 404}).
                    report();
            },
            'contains all status codes in the trail': function (topic) {
                var metric = topic.getMetric('statusCodesTrail');
                assert.deepEqual(metric, [301, 302, 404]);
            }
        },
        'non-redirect (e.g. terminal) first request': {
            topic: function () {
                return mock.initModule('mainRequest').
                    responseEnd({}, {status: 200}).
                    report();
            },
            'contains only its status code in the trail': function (topic) {
                var metric = topic.getMetric('statusCodesTrail');
                assert.deepEqual(metric, [200]);
            }
        },
        'multiple requests': {
            topic: function () {
                return mock.initModule('mainRequest').
                    responseEnd({}, {status: 200}).
                    recv({}, {status: 404}).
                    report();
            },
            'capture only the first request in the trail': function (topic) {
                var metric = topic.getMetric('statusCodesTrail');
                assert.deepEqual(metric, [200]);
            }
        }
    }).
    export(module);

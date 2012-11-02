/**
 * Plots ASCII-art waterfall
 */
exports.version = '0.5';

exports.skip = true;

exports.module = function(phantomas) {
	var requestsTimeline = {},
		currentRequests = 0,
		start = Date.now();

	function updatePlot() {
		requestsTimeline[ Date.now() - start ] = currentRequests;
	}

	phantomas.on('send', function(res) {
		currentRequests++;
		updatePlot();
	});

	phantomas.on('recv', function(entry,res) {
		currentRequests--;
		updatePlot();
	});

	// plot waterfall
	phantomas.on('report', function() {
		phantomas.addNotice('No of requests waterfall:');

		var delta = 100,
			lastValue = 0,
			value,
			lastTime = 0,
			values = {};

		// gather maximum values from each delta ms bucket
		for (var time in requestsTimeline) {
			value = requestsTimeline[time];
			lastValue = Math.max(lastValue, value);

			if (time > lastTime + delta) {
				lastTime = Math.ceil(time / delta) * delta;

				values[lastTime] = lastValue;

				lastValue = 0;
			}
		}

		// now plot the waterfall for each bucket
		lastValue = 1;
		for (var i=0; i<time; i+=delta) {
			// get the current bucket (or previous one)
			value = values[i] || lastValue;

			phantomas.addNotice(i + 'ms | ' + (new Array(value+1).join('=')));

			lastValue = value;
		}
	});
};

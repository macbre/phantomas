function queue() {
	var remaining = 0,
		jobs = 0,
		doneFn = [];

	function preCheck() {
		if (remaining === false) {
			throw new Error('Can\'t push jobs to completed queue');
		}
	}

	function postCheck() {
		if (remaining === 0 && doneFn.length > 0) {
			doneFn.forEach(function(fn) {
				fn(null, {
					jobs: jobs
				});
			});

			remaining = false;
		}
	}

	// public API
	return {
		// add a job to the queue
		push: function(fn) {
			preCheck();

			remaining++;
			jobs++;

			// pass an anonymous function to the callback
			// call it to mark a job as done
			fn(function() {
				remaining--;
				postCheck();
			});

			return this;
		},

		// call given function when all jobs added to the queue are done
		done: function(fn, scope) {
			doneFn.push(fn.bind(scope));
			postCheck();

			return this;
		}
	};
}

module.exports = queue;

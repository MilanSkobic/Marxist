 //had to modify cheerio to fix webworker bug, dont want to update

module.exports = function ajax_worker(self) {
	var cheerio = require('../cheerio/index.js');
	self.addEventListener('message', function ajax_req(msg) {
		var last = '',
			transport,
			request = msg.data;
		if (request.processes) { //cache request processes 
			var processes = request.processes.map(function mk_process(fnbody) {
				try {
					fn = new Function('prev', 'cur', 'callback', 'req', fnbody);
					return fn;
				} catch (e) {
					return console.log(e)
				}
			})
		}
		try {

			exec_req();

			if (request.frequency) {
				setInterval(exec_req, request.frequency);
			}

			function out(data, args) {
				var value, template;
				template = args ? args.template : request.template;
				if (template) {
					if (Array.isArray(data)) {
						value = data.map(function(v) {
							return render_template(template, v)
						})
					} else {
						value = render_template(template, data)
					}

				} else {
					value = JSON.stringifu(data)
				}
				//console.log(value)
				return self.postMessage({
					"set": {
						key: request.key || args.key,
						value: value
					}
				})

				function render_template(template, data) {
					var parent = cheerio.load(template),
						child, attributes, attribute, val;
					for (child in data) {
						attributes = data[child];
						for (attribute in attributes) {
							val = attributes[attribute];
							if (attribute === '_text') {
								parent(child).text(''+val);
							} else if (attribute === '_html') {
								parent(child).html(''+val);
							} else if (attribute === '_apply') { 
								cheerio.prototype[val.method].apply(parent(child), val.arguments);
							}
							else {
								parent(child).attr(attribute, ''+val);
							}

						}
					}
					res = parent.html();
					return res;
				}
			}

			function exec_req() {
				transport = new XMLHttpRequest();
				transport.onload = function(res) {
					var res = JSON.parse(this.responseText);
					if (this.responseText !== last) {
						if (processes) {
							var counter = 0,
								ores,
								_callback;
							_callback = function(err, nres, args) {
								if (err) {
									callback(err);
								}
								if (++counter === processes.length) {
									out(nres, args)
									last = nres;
								} else {
									processes[counter](ores, nres, _callback, args || request);
								}
								ores = nres;
								return
							}
							return processes[0](last, res, _callback, request);
						} else {
							last = res;
							out(res);
						}
					}
				}
				transport.open(request.method, request.url);
				transport.send();
			}
		} catch (e) {
			console.log(e)
		}
	})
}
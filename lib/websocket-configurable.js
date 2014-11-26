nodule.exports = function worker(self) {
	var cheerio = require('../cheerio/index.js');
	var dnode = require('dnode');
	var wss require('websocket-stream');

	var websocket, connector, component, _templates;
	websocket = new WebSocket(/url/);
	connector = wss(websocket);
	_templates = {};
	component = dnode({
			configureResource: function configure(key, template) {
				_templates[key] = template;
			},
			provideResource: function provide(key, data) {
				var value, template;
				template = _templates[key];
				console.log(data)
				if (template) {
					if (Array.isArray(data)) {
						value = data.map(function(v) {
							return render_template(template, v)
						})
					} else {
						value = render_template(template, data)
					}

				} else {
					value = JSON.stringify(data);
				}
				//console.log(value)
				return self.postMessage({
					"set": {
						key: args.key || request.key,
						value: value
					}
				})

				function render_template(template, data) {
					var parent = cheerio.load(template),
						child, attributes, attribute, str, res;
					for (child in data) {
						attributes = data[child];
						for (attribute in attributes) {
							str = String(attributes[attribute]);
							if (attribute === '_text') {
								parent(child).text(str);
							} else if (attribute === '_html') {
								parent(child).html(str);
							} else {
								parent(child).attr(attribute, str);
							}

						}

					}
					res = parent.html();
					return res;
				}
			}
		}

	});
	connector.pipe(component);
}
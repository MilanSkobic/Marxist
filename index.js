var webworkify = require('webworkify');


module.exports = function Marx_Resource(typ, name, storage) {
	////////////////////////////////////////////////////////////////////
	// :: string, object, Marx_db instance, url
	//
	var self = this,
		index = {},
		worker, store;
	name = name || typ + '-worker';
	switch (typ) {
		case "XMLHttpRequest":
			worker = webworkify(require('./lib/ajax.js'));
			break;
		case "WebSocket":
			worker = webworkify(require('./lib/websocket.js'));
			break;
		default:
			if (RegExp('^.*(.js)$').test(typ)) {
				worker = webworkify(require(typ));
			} else {
				return new Error("Resoource type " + typ + " not supported");
			}
	}
	if ((function supports_html5_Store() {
		try {
			return 'Storage' in window && window['Storage'] !== null;
		} catch (e) {
			return false;
		}
	})()) {
		switch (storage) {
			case 'local':
				Store = window.localStorage;
				break;
			case 'session':
				Store = window.sessionStorage;
				break;
			case 'global':
				Store = window.globalStorage
				break;
			case 'object':
				Store = window[name] = {};
				break
				break
			default:
				throw new Error("Marxist: unknown Storage type");
		}
	} else { // fail gracefully, but loudly
		console.log("Marx: WARNING!\
			\nNo " + Store + " support detected in browser,\ndefaulting to javascript object");
		Store = {};
	}
	console.log(worker)
	self.request = function request(requestobj) {
		console.log(requestobj)
		if (requestobj.processes) {
			var cap_re = RegExp('^(function [^{].*)');
			requestobj.processes = requestobj.processes.map(
				function decap_func(fn) {
					var fn_str = fn.toString(),
						decap;
					dcap = fn_str.replace(RegExp(cap_re));
					return dcap.substring(0, dcap.lastIndexOf('}'));
				})
		}
		worker.postMessage(requestobj);
		return self;
	}
	worker.addEventListener('message', function _report(msg) {
		var data = msg.data['set'],
			key = data.key;
		console.log(data)
		if (index[key]) {
			index[key].forEach(function _call(fn) {
				fn(data.value)
			})
		}
		Store[name] = data.value;
	})
	self.consumer = function report(key, fn) {
		var item = index[key] = index[key] || [];
		item.push(fn)
	}
	if (window && !window[name]){
		window[name] = self;
	}
	return self;
}





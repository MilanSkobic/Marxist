var Resource = require('../index.js');

var worker = new Resource("XMLHttpRequest", 'ticker', 'session');

var template = ['<div class="trade-event up">',
	'<div class="ticker sup"></div>',
	'<div class="exchange-short sub"></div>',
	'<div class="price sup"></div>',
	'<div class="amount sub"></div>',
	'</div>'
].join('\n');

var processor = function(prev, cur, callback) {
	function unix_to_human(unix) {
		//console.log(unix)
		var human = new Date(unix * 1000);
		return human.getHours() + ':' + human.getMinutes();
	}
	return callback(null, [{
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BFX"
		},
		'.price': {
			_text: prev.bitfinexbtcusd.last
		},
		'.amount': {
			_text: unix_to_human(prev.bitfinexbtcusd.date)
		}
	}, {
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BTSP"
		},
		'.price': {
			_text: prev.bitstampbtcusd.last
		},
		'.amount': {
			_text: unix_to_human(prev.bitstampbtcusd.date)
		}
	}, {
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BTCEB"
		},
		'.price': {
			_text: prev.btcebtcusd.last
		},
		'.amount': {
			_text: unix_to_human(prev.btcebtcusd.date)
		}
	}, {
		'.ticker': {
			_text: "BTCCNY"
		},
		'.exchange-short': {
			_text: "HUOBI"
		},
		'.price': {
			_text: prev.huobibtccny.last
		},
		'.amount': {
			_text: unix_to_human(prev.huobibtccny.date)
		}
	}], {
		'template': ['<div class="trade-event up">',
			'<div class="ticker sup"></div>',
			'<div class="exchange-short sub"></div>',
			'<div class="price sup"></div>',
			'<div class="amount sub"></div>',
			'</div>'
		].join('\n')
	})
}



worker.request({
	frequency: 300,
	// poll how often?
	method: "get",
	// what HTTP method to use?
	url: 'https://s2.bitcoinwisdom.com/ticker?',
	// URL string
	key: "ticker",
	//key related this request with a particular view
	// collapse into processes?
	processes: [processor],
})


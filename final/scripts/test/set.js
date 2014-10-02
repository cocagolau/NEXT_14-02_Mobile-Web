
function inherit(p) {
	if (p == null) throw TypeError();
	if (Object.create) return Object.create(p);
	var t = typeof p;

	if (t !== "object" && t !== "function") throw TypeError();

	function f() {};
	f.prototype = p;
	return new f();
}

function extend(o, p) {
	for (var prop in p) {
		o[prop] = p[prop];
	}

	return o;
}

function merge(o, p) {
	for (var prop in p) {
		if (o.hasOwnProperty(prop)) continue;
		o[prop] = p[prop];
	}

	return o;
}

function restrict(o, p) {
	for (var prop in o) {
		if (!prop in p) delete o[prop];
	}

	return o;
}

function subtract(o, p) {
	for (var prop in p) {
		delete o[prop];
	}

	return o;
}

function union(o, p) {
	return extend(extend({}, o), p);
}

function intersection(o, p) {
	return restrict(extend({}, o), p);
}

function keys(o) {
	if (typeof o !== "object") throw TypeError();

	var result = [];
	for (var prop in o) {
		if (o.hasOwnProperty(prop)) {
			result.push(prop);
		}
	}

	return result;
}

//**************
function range(from, to) {
	var r = inherit(range.methods);

	r.from = from;
	r.to = to;
}

range.methods = {
	includes: function(x) {
		return this.from <= x && x <= this.to;
	},
	foreach: function(f) {
		for (var x = Math.ceil(this.from); x<=this.to; x++) {
			f(x);
		}
	},
	toString: function() {
		return "(" + this.from + " ... " + this.to + ")";
	}
};
//--------------
var r = range(1, 3);
r.includes(2);
r.foreach(console.log);
console.log(r);


//**************
function Range(from, to) {
	this.from = from;
	this.to = to;
}

Range.prototype = {
	constructor: Range,
	includes: function(x) {
		return this.from <= x && x <= this.to;
	},
	foreach: function(f) {
		for (var x = Math.ceil(this.from); x<=this.to; x++) {
			f(x);
		}
	},
	toString: function() {
		return "(" + this.from + " ... " + this.to + ")";
	},
	equals: function(that) {
		if (that == null) return false;
		if (that.constructor !== Range) return false;
		return this.from == that.from && this.to == that.to;
	}
}


//--------------
var r = new Range(1, 3);
r.includes(2);
r.foreach(console.log);
console.log(r);


//**************
function Type(o) {
	var t, c, n;

	if (o === null) return "null";
	if (o !== o) return "nan";
	if ((t == typeof o) !== "object") return t;
	if ((c == classof(o)) !== "Object") return c;
	if (o.constructor && typeof o.constructor === "function" && (n = o.constructor.getName())) return n;

	return "Object";
}

function classof(o) {
	return Object.prototype.toString.call(o).slice(8, -1);
}

Function.prototype.getName = function() {
	if ("name" in this) return this.name;
	return this.name = this.toString().match(/function\s*([^(]*)\(/)[1];
}


//--------------



//**************

function Set() {
	this.values = {};
	this.n = 0;
	this.add.apply(this, arguments);
}

Set.prototype.add = function() {
	for (var i=0, len=arguments.length; i<len; i++) {
		var val = arguments[i];
		var str = Set._v2s(val);
		if (!this.values.hasOwnProperty(str)) {
			this.values[str] = val;
			this.n++;
		}
	}
	return this;
}

Set.prototype.remove = function() {
	for (var i=0; len=arguments.length; i<len; i++) {
		var str = Set._v2s(arguments[i]);
		if (this.values.hasOwnProperty(str)) {
			delete this.values[str];
			this.n--;
		}
	}
	return this;
}

Set.prototype.contains = function(value) {
	return this.values.hasOwnProperty(Set._v2s(value));
}

Set.prototype.size = function() {
	return this.n;
}

Set.prototype.foreach = function(f, context) {
	for (var s in this.values) {
		if (this.values.hasOwnProperty(s)) {
			f.call(context, this.values[s]);
		}
	}
}
Set.prototype.equals = function(that) {
	if (this == that) return true;
	if (!(that instanceof Set)) return false;
	if (this.size() != that.size()) return false;

	try {
		this.foreach(function(v) {
			if (!that.contains(v)) throw false;
		});
		return true;

	} catch (x) {
		if (x === false) return false;
		throw x;
	}
};

Set._v2s = function(val) {
	switch(val) {
		case undefined: return 'u';
		case null: 		return 'n';
		case true: 		return 't';
		case false: 	return 'f';
		default: switch (typeof val) {
			case 'number': 	return '#' + val;
			case 'string': 	return '"' + val;
			default: 		return '@' + objectId(val);
		}
	}

	function objectId(o) {
		var prop = "|**objectid**|";
		if (!o.hasOwnProperty(prop)) {
			o[prop] = Set._v2s.next++;
		}
		return o[prop];
	}
}
Set._v2s.next = 100;

//**************
function enumeration(namesToValues) {
	var enumeration = function() {
		throw "열거형은 인스턴스화할 수 없습니다";
	};

	var proto = enumeration.prototype = {
		constructor: enumeration,
		toString: function() { return this.name; }
		valueOf: function() { return this.value; }
		toJSON: function() { return this.name; }
	};

	enumeration.values = [];

	for (name in namesToValues) {
		var e = inherit(proto);
		e.name = name;
		e.value = namesToValues[name];
		enumeration[name] = e;
		enumeration.values.push(e);
	}

	enumeration.foreach = function(f, c) {
		for (var i=0, len=this.values.length; i<len; i++) {
			f.call(c, this.values[i]);
		}
	}

	return enumeration;

}

//--------------
var Coin = enumeration({Penny: 1, Nickel:5, Dime:10, Quarter:25});
var c = Coin.Dime;
c instanceof Coin;
c.constructor == Coin;
Coin.Quarter + 3*Coin.Nickel;
Coin.Dime == 10;
Coin.Dime > Coin.Nickel;
String(Coin.Dime) + ":" + Coin.Dime;
//**************

function Card(suit, rank) {
	this.suit = suit;
	this.rank = rank;
}

Card.Suit = enumeration({Clubs:1, Diamonds:2, Hearts:3, Spades:4});
Card.Rank = enumeration({Two:2, Three:3, Four:4, Five:5, Six:6,
							Seven:7, Eight:8, Nine:9, Ten:10,
							Jack:11, Queen:12, King:13, Ace:14});

Card.prototype.toString = function() {
	return this.rank.toString() + " of " + this.suit.toString();
};

Card.prototype.compareTo = function(that) {
	if (this.rank > that.rank) return -1;
	if (this.rank < that.rank) return 1;
	return 0;
};

Card.orderByRank = function(a, b) {
	return a.compareTo(b);
};

Card.orderBySuit = function(a, b) {
	if (a.suit < b.suit) return -1;
	if (a.suit > b.suit) return 1;
	if (a.rank < b.rank) return -1;
	if (a.rank > b.rank) return 1;
	return 0;
};
//--------------

function Deck() {
	var cards = this.cards = [];
	Card.Suit.foreach(function(s) {
		Card.Rank.foreach(function(r) {
			cards.push(new Card(s, r));
		});
	});
}

Deck.prototype.shuffle = function() {
	var deck = this.cards,
		len = deck.length;

	for (var i=len-1; i>0; i--) {
		var r = Math.floor(Math.random()*(i+1)),
			temp;
		
		temp = deck[i],
		deck[i] = deck[r];
		deck[r] = temp;
	}

	return this;
};

Deck.prototype.deal = function(n) {
	if (this.cards.length < n) {
		throw "Out of cards";
	}

	return this.cards.splice(this.cards.length-n, n);
};
//--------------
var deck = (new Deck()).shuffle();
var hand = deck.deal(13).sort(Card.orderBySuit);


//**************
extend(Set.prototype, {
	toString: function() {
		var s = "{",
			i = 0;
		this.foreach(function(v) {
			s += ((i++ > 0)?", " : "") + v;
		});

		return s + "}";
	},

	toLocaleString: function() {
		var s = "{",
			i = 0;

		this.foreach(function(v) {
			if (i++ > 0) 	s += ", ";
			if (v == null) 	s += v;
			else			s += v.toLocaleString();
		});

		return s + "}";
	},

	toArray: function() {
		var a = [];
		this.foreach(function(v) {
			a.push(v);
		});

		return a;
	}
})



























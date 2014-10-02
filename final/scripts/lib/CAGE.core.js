(function(window) {
	'use strict';
	var document = window.document;
	var console = window.console;


	var CAGE = window.CAGE || {};
	CAGE.$ = CAGE.$ || {};

	var $ = (function() {
		/*
		Object.prototype.$inherit = function(p) {
			if (p == null) 		throw TypeError();
			if (Object.create) 	return Object.create(p);

			var t = typeof p;
			if (t !== "object" && t !== "function") throw TypeError();

			function f() {};
			f.prototype = p;
			return new f();
		};

		Object.prototype.$extend = function(superClass, methods, statics) {
			this.prototype = Object.$inherit(superClass.prototype);
			this.prototype.constructor = this;

			if (methods) Object.$$extend(this.prototype, methods);
			if (statics) Object.$$extend(this, statics);

			return constructor;
		}
		*/

		Object.prototype.$extend = function(o) {
			for (var prop in o) {
				if (!this.hasOwnProperty(prop)) {
					this[prop] = o[prop];
				}
			}
		};


		// extended HTMLElement
		var fn = window.HTMLElement.prototype;
		fn.$extend({
			on: function() {
				console.log('on');

				return this;
			},

			off: function() {
				console.log('off');

				return this;	
			}
		});





		// EventEmitter
		function EventEmitter() {
			this.events = [];
		}
		EventEmitter.prototype.on = function(fn) {
			this.events.push(fn);
		},
		EventEmitter.prototype.off = function(fn) {
			var newEvents = [];
			// 입력받은 함수와 같은것만 빼고 유지. 
			for (var i=0, len=this.events.length; i<len; ++i) {
				if (this.events[i] !== fn) {
					newEvents.push(this.events[i]);
				}
			}
			this.events = newEvents;
		};
		EventEmitter.prototype.trigger = function() {
			for (var i=0, len=this.events.length; i<len; ++i) {
				this.events[i](arguments);
			}
		};

		// Core
		function Core() {


		}
		// Core.prototype
		var core = new Core();




		// Selector
		function Selector(selector) {
			return document.querySelector(selector);
		}


		return Selector;

	}());

	CAGE.$ = $;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = CAGE;
		// browser export
	} else {
		window.CAGE = CAGE;
	}
	
}(this));
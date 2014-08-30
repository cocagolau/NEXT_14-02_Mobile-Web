(function() {
	'use strict';

	var document = window.document;
	var console = window.console;
	var APP = window.APP || {};

	APP.sidebar = APP.sidebar || {};
 	

 	/*
	@param: config <object>
		config.viewSelector: <string: selector>
		config.buttonSelector: <string: selector>
 	*/
 	function Sidebar(config) {
 		this.viewEl = null;
 		this.buttonEl = null;

 		this.init(config);
 	}
 	var fn = Sidebar.prototype;

 	fn.init = function(config) {
 		this.viewEl = document.querySelector(config.viewSelector);
 		this.viewEl.addEventListener('transitionend', this.listen.bind(this), false);

 		this.buttonEl = document.querySelector(config.buttonSelector);

 		// event listening 시작
 		this.listen();
 	};

 	fn.listen = function() {
 		this.bindedToggleFn = this.toggle.bind(this);
 		this.buttonEl.addEventListener('click', this.bindedToggleFn, false);
 	};

 	fn.unlisten = function() {
 		this.buttonEl.removeEventListener('click', this.bindedToggleFn, false);
 		this.bindedToggleFn = undefined;
 	};
 
 	fn.toggle = function() {
 		// event listening 중단
 		this.unlisten();

 		var classList = this.viewEl.classList;

 		// 이전 tansition관련 class존재시 제거, 아니면 추가
 		var method = (classList.contains('open'))?'remove':'add';
 		classList[method]('open');
 	};


	APP.sidebar = Sidebar;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = APP;
		// browser export
	} else {
		window.APP = APP;
	}

}(this));
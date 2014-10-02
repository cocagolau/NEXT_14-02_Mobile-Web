var $ = CAGE.$;
var $dom = CAGE.util.dom;
var $template = CAGE.util.template;


function Page(obj) {
	this.title = obj.title;
	this.imgs = obj.imgs;
	this.content = obj.content;
	this.addr = obj.addr;
	this.tel = obj.tel;
}


function ArticleModel() {
	this.listeners = [];
	this.pages = [];
	this.currentPageIdx = null;
	this.flicking = null;

	this.page = {
		//index: null,
		previous: null,
		current: null,
		next: null
	};

	this.init();
}

ArticleModel.prototype = {
	constructor: ArticleModel,
	init: function() {
		this.flicking = false;
		this.currentPageIdx = 0;

		for (var i=0; i<10; i++) {
			var page = new Page({
				title: "test" + i,
				imgs: [],
				content: "this is test page" + i,
				addr: "addr-test" + i,
				tel: "000-1111-1111"
			});

			this.pages.push(page);
		}

		//this.setPage();
	},

	addListener: function(listener) {
		this.listeners[this.listeners.length] = listener;
	},

	removeListener: function(listener) {
		var len = this.listeners.length;

		if (len == 0)
			return;

		var newListeners = [];
		for (var i=0; i<len; i++) {
			if (this.listeners[i] != listener) {
				newListeners[newListeners.length] = this.listeners[i];
			}
		}
		this.listeners = newListeners;
	},

	notify: function() {
		for (var i = 0, len=this.listeners.length; i<len; i++) {
			this.listeners[i].changed(this);
		}
	},
	getPreviousPage: function() {
		console.log("previous");

		if (this.currentPageIdx == 0) {
			console.log("이전 페이지가 없습니다");
			return null;
		}

		return this.pages[this.currentPageIdx - 1];
	},

	getCurrentPage: function() {
		console.log("current");
		return this.pages[this.currentPageIdx];
	},

	getNextPage: function() {
		console.log("next");

		var size = this.pages.length;
		if (this.currentPageIdx >= size) {
			console.log("다음 페이지가 없습니다");
			return null;
		}

		return this.pages[this.currentPageIdx + 1];
	}


}


function PageController(args) {
	this.model = args.model;
	this.view = args.view;

	this.model.addListener(this);
	this.view.setController(this);
	
	this.view.render();
}

PageController.prototype = {
	constructor: PageController,

	changed: function() {
		
	},

	getCurrentPage: function() {
		return this.model.getCurrentPage();
	},

	getNextPage: function() {
		return this.model.getNextPage();
	},

	getPreviousPage: function() {
		return this.model.getPreviousPage();
	}
};


function PageView(obj) {
	this.controller = null;
	this.template = document.querySelector(obj.templateId).innerText;
	this.container = document.querySelector(obj.elId);

	//this.targetEl = null;

	this.height = window.innerHeight*0.9;
	this.halfHeight = this.height/2;

	this.init();
	
};

PageView.prototype = {
	constructor: PageView,
	init: function() {
		this.touch.startTime = null;
		this.touch.moveId = null;

		this.animation.index = 0;
		this.animation.deltaY = 0;
		this.animation.currentTop = 0;

		this.eventBind();

		this.removeAnimationEnd();
		this.addTouch();
	},

	touch: {
		start: function(e) {
			console.log("touch start");
			this.targetEl = e.target;

			var newStartTime = e.touches[0].timestamp;
			if (this.touch.startTime != newStartTime) {

				// 기존 loop 종료
				if (this.touch.moveId != null) {
					cancelAnimationFrame(this.touch.moveId);
					this.touch.moveId = null;
				}
				
				this.touch.startTime = newStartTime;
			}

			this.animation.index = e.touches[0].clientY;
			this.animation.currentTop = (this.targetEl.style.top === "")? 0 : parseInt(this.targetEl.style.top);
			this.touch.moveId = requestAnimationFrame(this.bindedFn.animationUpdate);
		},

		move: function(e) {
			console.log("touch move");
			e.preventDefault();
	
			this.animation.deltaY = e.touches[0].clientY - this.animation.index;
			console.log("deltaY: " +this.animation.deltaY);
		},

		end: function(e) {
			console.log("touch end");

			cancelAnimationFrame(this.touch.moveId);
			this.touch.moveId = null;
			this.touch.startTime = null;

			var deltaY = e.changedTouches[0].clientY - this.animation.index;
			console.log("end: daltaY: " + deltaY);
			this.bindedFn.animationExec(deltaY);
		}
	},

	animation: {
		exec: function(deltaY) {
			this.animation.index = 0;
			this.animation.currentTop = 0;
			this.animation.deltaY = 0;

			if (deltaY == 0) return;

			this.removeTouch();
			this.addAnimationEnd();

			$dom.addClass(this.targetEl, "move");
			console.log("deltaY: " + deltaY);

			$dom.addClass(this.targetEl, (Math.abs(deltaY)/this.height >= 0.5)?(deltaY>0)?"down":"up":"restore");
			this.targetEl.removeAttribute('style');
		},
		update: function() {
			this.targetEl.style.top = this.animation.currentTop + this.animation.deltaY + "px";
			this.touch.moveId = requestAnimationFrame(this.bindedFn.animationUpdate);
			this.controller.changed(this, this.animation.deltaY);
		},
		end: function() {
			console.log("transition end");

			$dom.removeClass(this.targetEl, "move");
			$dom.removeClass(this.targetEl, "down");
			$dom.removeClass(this.targetEl, "up");
			$dom.removeClass(this.targetEl, "restore");

			this.removeAnimationEnd();
			this.addTouch();
		}
	},
	//************

	setController: function(controller) {
		this.controller = controller;
	},

	update: function() {

	},

	render: function() {
		var state = ['Current', 'Next', 'Previous'];
		for (var i in state) {
			var key = state[i];
			var el = this.container.querySelector('[data-id="' + key.toLowerCase() + '"]');
			var model = this.controller["get" + key + "Page"]();
			if (model !== null) {
				el.innerHTML = $template.compile(model, this.template);

			} else {
				console.log("none");
			}
			
		}
	},

	//************

	addTouch: function() {
		this.container.addEventListener('touchstart', this.bindedFn.touchstart);
		this.container.addEventListener('touchmove', this.bindedFn.touchmove);
		this.container.addEventListener('touchend', this.bindedFn.touchend);
	},

	removeTouch: function() {
		this.container.removeEventListener('touchstart', this.bindedFn.touchstart);
		this.container.removeEventListener('touchmove', this.bindedFn.touchmove);
		this.container.removeEventListener('touchend', this.bindedFn.touchend);
	},

	addAnimationEnd: function() {
		this.container.addEventListener('transitionend', this.bindedFn.animationEnd);
	},

	removeAnimationEnd: function() {
		this.container.removeEventListener('transitionend', this.bindedFn.animationEnd);
	},

	eventBind: function() {
		this.bindedFn = {};
		this.bindedFn.touchstart = this.touch.start.bind(this);
		this.bindedFn.touchmove = this.touch.move.bind(this);
		this.bindedFn.touchend = this.touch.end.bind(this);
		this.bindedFn.animationExec = this.animation.exec.bind(this);
		this.bindedFn.animationUpdate = this.animation.update.bind(this);
		this.bindedFn.animationEnd = this.animation.end.bind(this);
	}

}


// service code
function App() {
	this.init();
}

App.prototype = {
	constructor: App,
	init: function() {

		// create view
		var pageView = new PageView({
			elId: '.article',
			templateId: '#page-template'
		});

		var articleModel = new ArticleModel();


		// create controller
		this.controller = new PageController({
			view: pageView,
			model: articleModel
		});


	}
}


var app = new App();







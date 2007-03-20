/*
 *  $Id$
 *
 *  This file is part of the OpenLink Software Ajax Toolkit (OAT) project.
 *
 *  Copyright (C) 2006 Ondrej Zara and OpenLink Software
 *
 *  See LICENSE file for details.
 */
/*
	OAT.Loader.preInit(callback) - do something when everything is loaded
	OAT.Loader.loadFeatures(features,callback) - do something when features are loaded
	OAT.Loader.loadedLibs = ["ajax2","window",...]
	
	Contains: 
	* OAT
	* OAT.Events
	* OAT.Dom
	* OAT.Loader
	* OAT.Files
	* OAT.Dependencies
	* OAT.MSG
	* OAT.Debug
	
*/

/* global namespace */
window.OAT = {};
window.OAT.Events = [];

/* several helpful prototypes */
Array.prototype.copy = function() {
	var a = [];
	for (var i=0;i<this.length;i++) { a.push(this[i]); }
	return a;
}

Array.prototype.find = function(str) {
	var index = -1;
	for (var i=0;i<this.length;i++) if (this[i] == str) { index = i; }
	return index;
}

Array.prototype.append = function(arr) {
	var a = arr;
	if (!(arr instanceof Array)) { a = [arr]; }
	for (var i=0;i<a.length;i++) { this.push(a[i]); }
}

String.prototype.trim = function() {
	var result = this.match(/^ *(.*?) *$/);
	return (result ? result[1] : this);
}

String.prototype.repeat = function(times) {
	var ret = '';
	for (var i=0;i<times;i++) { ret += this; }
	return ret;
}

String.prototype.leadingZero = function(length) {
	var l = (length ? length : 2);
	var tmp = this;
	while (tmp.length < l)  { tmp = "0"+tmp; }
	return tmp.toString();
}

Date.prototype.format = function(formatStr) {
	var result = formatStr;
	result = result.replace(/d/,this.getDate().toString().leadingZero(2));
	result = result.replace(/g/,parseInt(this.getHours()) % 12);
	result = result.replace(/G/,this.getHours());
	result = result.replace(/h/,(parseInt(this.getHours()) % 12).toString().leadingZero(2));
	result = result.replace(/H/,this.getHours().toString().leadingZero(2));
	result = result.replace(/i/,this.getMinutes().toString().leadingZero(2));
	result = result.replace(/j/,this.getDate());
	result = result.replace(/m/,(this.getMonth()+1).toString().leadingZero(2));
	result = result.replace(/n/,this.getMonth()+1);
	result = result.replace(/s/,this.getSeconds().toString().leadingZero(2));
	result = result.replace(/U/,this.getTime());
	result = result.replace(/w/,this.getDay());
	result = result.replace(/Y/,this.getFullYear());
	
	return result;
}

Date.prototype.toHumanString = function() {
	return this.format("j.n.Y H:i:s");
}

/* DOM common object */
/*
	$(something)
	$v(something)
	
	OAT.Dom.create(tagName,styleObj,className)
	OAT.Dom.text(text)
	OAT.Dom.append([parent1,child1,child2],[parent2,child3,child4],...)
	OAT.Dom.option(name,value,parent)
	OAT.Dom.hide(elm)
	OAT.Dom.show(elm)
	OAT.Dom.clear(elm)
	OAT.Dom.unlink(elm)
	OAT.Dom.center(elm,x,y)
	OAT.Dom.isChild(child,parent)
	OAT.Dom.isIE()
	OAT.Dom.isGecko()
	OAT.Dom.isOpera()
	OAT.Dom.isWebKit()
	OAT.Dom.hex2dec(hex_str)
	OAT.Dom.dec2hex(dec_num)
	OAT.Dom.color(str)
	OAT.Dom.applyStyle(elm,obj)
	OAT.Dom.isClass(something,className)
	OAT.Dom.addClass(something,className)
	OAT.Dom.removeClass(something,className)
	OAT.Dom.collide(something1,something2)
	OAT.Dom.(at|de)tach(element,event,callback)
	OAT.Dom.source(event)
	OAT.Dom.eventPos(event)
	OAT.Dom.style(element,property)
	OAT.Dom.position(something)	
	OAT.Dom.getLT(something)
	OAT.Dom.getWH(something)
	OAT.Dom.moveBy(element,dx,dy)
	OAT.Dom.resizeBy(element,dx,dy)
	OAT.Dom.removeSelection()
	OAT.Dom.getScroll()
	OAT.Dom.getViewport()
	OAT.Dom.getFreeSpace()
	OAT.Dom.decodeImage(data)
	OAT.Dom.toSafeXML(str)
	OAT.Dom.fromSafeXML(str)
*/

function $(something) {
	if (typeof(something) == "string") {
		var elm = document.getElementById(something);
	} else {
		var elm = something;
	}
	if (something instanceof Array) {
		var elm = [];
		for (var i=0;i<something.length;i++) { elm.push($(something[i])); }
	}
	if (!elm) return false;
	return elm;
}

function $$(something) {
	var e = $(something);
	if (!e) return false;
	if (!("value" in e)) return false;
	return e.value;
}

function $v(something) {
	var e = $(something);
	if (!e) return false;
	if (!("value" in e)) return false;
	return e.value;
}

OAT.Dom = {
	create:function(tagName,styleObj,className) {	
		var elm = document.createElement(tagName);
		if (styleObj) {
			for (prop in styleObj) { elm.style[prop] = styleObj[prop]; }
		}
		if (className) { elm.className = className; }
		return elm;
	},

	createNS:function(ns,tagName) {	
		if (document.createElementNS) {
			var elm = document.createElementNS(ns,tagName);
		} else {
			var elm = document.createElement(tagName);
			elm.setAttribute("xmlns",ns);
		}
		return elm;
	},
	
	text:function(text) {
		var elm = document.createTextNode(text);
		return elm;
	},
	
	button:function(label) {
		var b = OAT.Dom.create("input");
		b.type = "button";
		b.value = label;
		return b;
	},
	
	radio:function(name) {
		if (OAT.Dom.isIE()) {
			var elm = document.createElement('<input type="radio" name="'+name+'" />');
			return elm;
		} else {
			var elm = OAT.Dom.create("input");
			elm.name = name;
			elm.type = "radio";
			return elm;
		}
	},
	
	append:function() {
		for (var i=0;i<arguments.length;i++) {
			var arr = arguments[i];
			if (!(arr instanceof Array)) { continue; }
			if (arr.length < 2) { continue; }
			var parent = $(arr[0]);
			for (var j=1;j<arr.length;j++) {
				parent.appendChild($(arr[j]));
			}
		}
	},
	
	option:function(name,value,parent) {
		var opt = OAT.Dom.create("option");
		opt.innerHTML = name;
		opt.value = value;
		if (parent) { $(parent).appendChild(opt); }
		return opt;
	},
	
	hide:function(element) {
		if (arguments.length > 1) {
			for (var i=0;i<arguments.length;i++) { OAT.Dom.hide(arguments[i]); }
			return;
		}
		if (element instanceof Array) {
			for (var i=0;i<element.length;i++) { OAT.Dom.hide(element[i]); }
			return;
		}
		var elm = $(element);
		if (!elm) { return; }
		/* ie input hack */
		var inputs_ = elm.getElementsByTagName("input");
		var inputs = [];
		for (var i=0;i<inputs_.length;i++) { inputs.push(inputs_[i]); }
		if (elm.tagName.toLowerCase() == "input") { inputs.push(elm); }
		for (var i=0;i<inputs.length;i++) {
			var inp = inputs[i];
			if (inp.type == "radio" || inp.type == "checkbox") {
				if (!inp.__checked) { inp.__checked = (inp.checked ? "1" : "0"); }
			}
		} 
		/* */
		elm.style.display = "none";
	},
	
	show:function(element) {
		if (arguments.length > 1) {
			for (var i=0;i<arguments.length;i++) { OAT.Dom.show(arguments[i]); }
			return;
		}
		if (element instanceof Array) {
			for (var i=0;i<element.length;i++) { OAT.Dom.show(element[i]); }
			return;
		}
		var elm = $(element);
		if (!elm) { return; }
		elm.style.display = "";
		/* ie input hack */
		var inputs_ = elm.getElementsByTagName("input");
		var inputs = [];
		for (var i=0;i<inputs_.length;i++) { inputs.push(inputs_[i]); }
		if (elm.tagName.toLowerCase() == "input") { inputs.push(elm); }
		for (var i=0;i<inputs.length;i++) {
			var inp = inputs[i];
			if (inp.type == "radio" || inp.type == "checkbox") {
				if (inp["__checked"] && inp.__checked === "1") { inp.checked = true; }
				if (inp["__checked"] && inp.__checked === "0") { inp.checked = false; }
				inp.__checked = false;
			}
		} 
		/* */
	},

	clear:function(element) {
		var elm = $(element);
		while (elm.firstChild) { elm.removeChild(elm.firstChild); }
	},
	
	unlink:function(element) {
		var elm = $(element);
		if (!elm) { return; }
		if (!elm.parentNode) { return; }
		elm.parentNode.removeChild(elm);
	},
	
	center:function(element,x,y,reference) {
		var elm = $(element);
		var p = elm.offsetParent;
		if (reference) { p = reference; }
		var par_dims = OAT.Dom.getWH(p);
		var dims = OAT.Dom.getWH(elm);
		var new_x = Math.round(par_dims[0]/2 - dims[0]/2);
		var new_y = Math.round(par_dims[1]/2 - dims[1]/2);
		if (new_y < 0) { new_y = 30; }
		var s = OAT.Dom.getScroll();
		new_x += s[0];
		new_y += s[1];
		if (x) { elm.style.left = new_x + "px"; }
		if (y) { elm.style.top = new_y + "px"; }
	},
	
	isChild:function(child,parent) {
		var c_elm = $(child);
		var p_elm = $(parent);
		/* walk up from the child. if we find parent element, return true */
		var node = c_elm.parentNode;
		do {
			if (!node) { return false; }
			if (node == p_elm) { return true; }
			node = node.parentNode;
		} while (node != document.body && node != document);
		return false;
	},
	
	isIE:function() {
		return (document.attachEvent && !document.addEventListener ? true : false);
	},
	
	isIE7:function() {
		return (navigator.userAgent.match(/msie 7/i));
	},
	
	isIE6:function() {
		return (OAT.Dom.isIE() && !OAT.Dom.isIE7());
	},

	isGecko:function() {
		return (document.addEventListener ? true : false);
	},
	
	isOpera:function() {
		return (navigator.userAgent.match(/Opera/));
	},
	
	isWebKit:function() {
		return (navigator.userAgent.match(/AppleWebKit/));
	},
	
	isMac:function() {
		return (navigator.platform.toString().match(/mac/i));
	},
	
	hex2dec:function(hex_str) {
		return parseInt(hex_str,16);
	},
	
	dec2hex:function(num) {
		return num.toString(16);
	},
	
	color:function(str) {
		/* returns [col1,col2,col3] in decimal */
		if (str.match(/#/)) {
			/* hex */
			if (str.length == 4) {
				var tmpstr = "#"+str.charAt(1)+str.charAt(1)+str.charAt(2)+str.charAt(2)+str.charAt(3)+str.charAt(3);
			} else {
				var tmpstr = str;
			}
			var tmp = tmpstr.match(/#(..)(..)(..)/);
			return [OAT.Dom.hex2dec(tmp[1]),OAT.Dom.hex2dec(tmp[2]),OAT.Dom.hex2dec(tmp[3])];
		} else {
			/* decimal */
			var tmp = str.match(/\(([^,]*),([^,]*),([^\)]*)/);
			return [parseInt(tmp[1]),parseInt(tmp[2]),parseInt(tmp[3])];
		}
	},
	
	applyStyle:function(something,obj) {
		var elm = $(something);
		if (!elm) {return;}
		for (var p in obj) { elm.style[p] = obj[p]; }
	},
	
	isClass:function(something,className) {
		var elm = $(something);
		if (!elm) { return false; }
		if (className == "*") { return true; }
		if (className == "") { return false; }
		if (!elm.className) { return false; }
		var arr = elm.className.split(" ");
		var index = arr.find(className);
		return (index != -1);
	},
	
	addClass:function(something,className) {
		var elm = $(something);
		if (!elm) { return; }
		if (OAT.Dom.isClass(elm,className)) { return; }
		var arr = elm.className.split(" ");
		arr.push(className);
		if (arr[0] == "") { arr.splice(0,1); }
		elm.className = arr.join(" ");
	},
	
	removeClass:function(something,className) {
		var elm = $(something);
		if (!elm) { return; }
		if (!OAT.Dom.isClass(elm,className)) { return; } /* cannot remove non-existing class */
		if (className == "*") { elm.className = ""; } /* should not occur */
		var arr = elm.className.split(" ");
		var index = arr.find(className);
		if (index == -1) { return; } /* should NOT occur! */
		arr.splice(index,1);
		elm.className = arr.join(" ");
	},
	
	collide:function(something1,something2) {
		/* true if they have something common */
		var coords_1 = OAT.Dom.position(something1);
		var coords_2 = OAT.Dom.position(something2);
		var dims_1 = OAT.Dom.getWH(something1);
		var dims_2 = OAT.Dom.getWH(something2);
		var bad_x = ( (coords_1[0] < coords_2[0] && coords_1[0]+dims_1[0] < coords_2[0]) || (coords_1[0] > coords_2[0] + dims_2[0]) );
		var bad_y = ( (coords_1[1] < coords_2[1] && coords_1[1]+dims_1[1] < coords_2[1]) || (coords_1[1] > coords_2[1] + dims_2[1]) );
		return !(bad_x || bad_y);
	},
	
	_attach:function(element,event,callback) {
		if (element.addEventListener) {
			/* gecko */
			element.addEventListener(event,callback,false);
		} else if (element.attachEvent) {
			/* ie */
			element.attachEvent("on"+event,callback);
		} else {
			/* ??? */
			element["on"+event] = callback;
		}
	},
	
	_detach:function(element,event,callback) {
		if (element.removeEventListener) {
			/* gecko */
			element.removeEventListener(event,callback,false);
		} else if (element.detachEvent) {
			/* ie */
			element.detachEvent("on"+event,callback);
		} else {
			/* ??? */
			element["on"+event] = false;
		}
	},
	
	attach:function(elm,event,callback) {
		var element = $(elm);
		OAT.Dom._attach(element,event,callback);
	},
	
	detach:function(elm,event,callback) {
		var element = $(elm);
		OAT.Dom._detach(element,event,callback);
	},

	source:function(event) {
		return (event.target ? event.target : event.srcElement);
	},
	
	eventPos:function(event) {

		if (0 && OAT.Dom.isWebKit()) { /* temporarily disabled; it looks like new webkits correctly report coords relative to viewport */
			return [event.clientX,event.clientY];
		} else {
			var sl = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
			var st = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
			return [event.clientX+sl,event.clientY+st];
		}
	},
	
	getViewport:function() {
		if (OAT.Dom.isOpera() || OAT.Dom.isIE6()) {
			return [document.body.clientWidth,document.body.clientHeight];
		} else if (document.compatMode == "BackCompat") {
			return [document.body.clientWidth,document.body.clientHeight];
		} else {
			return [document.documentElement.clientWidth,document.documentElement.clientHeight];
		}
	},
	
	style:function(elm,property) {
		var element = $(elm);
		if (document.defaultView && document.defaultView.getComputedStyle) {
			var cs = document.defaultView.getComputedStyle(element,'');
			if (!cs) { return true; }
			return cs[property];
		} else {
			return element.currentStyle[property];
		} 
	},
	
	position:function(something) {
		var elm = $(something);
		var parent = elm.offsetParent;
		if (elm == document.body || elm == document || !parent) { return OAT.Dom.getLT(elm); }
		var parent_coords = OAT.Dom.position(parent);
		var c = OAT.Dom.getLT(elm);
		/*
		var x = elm.offsetLeft - elm.scrollLeft + parent_coords[0];
		var y = elm.offsetTop - elm.scrollTop + parent_coords[1];
		*/
		
		/*
			this is interesting: Opera with no scrolling reports scrollLeft/Top equal to offsetLeft/Top for <input> elements
		*/
		var x = c[0];
		var y = c[1];
		if (elm.tagName.toLowerCase() != "input" || !OAT.Dom.isOpera()) {
			x -= elm.scrollLeft;
			y -= elm.scrollTop;
		}
		
		if (OAT.Dom.isWebKit() && parent == document.body && OAT.Dom.style(elm,"position") == "absolute") { return [x,y]; }
		
		x += parent_coords[0];
		y += parent_coords[1];
		return [x,y];
	},
	
	getLT:function(something) {
		var elm = $(something);
		var curr_x,curr_y;
		if (elm.style.left && elm.style.position != "relative") {
			curr_x = parseInt(elm.style.left);
		} else {
			curr_x = elm.offsetLeft;
		}
		if (elm.style.top && elm.style.position != "relative") {
			curr_y = parseInt(elm.style.top);
		} else {
			curr_y = elm.offsetTop;
		}
		return [curr_x,curr_y];
	},
		
	
	getWH:function(something) {
		/*
			This is tricky: we need to measure current element's width & height.
			If this property was already set (thus available directly through elm.style),
			everything is ok.
			If nothing was set yet:
				* IE stores this information in offsetWidth and offsetHeight
				* Gecko doesn't count borders into offsetWidth and offsetHeight
			Thus, we need another means for counting real dimensions.
		*/
		var curr_w, curr_h;
		var elm = $(something);
		if (elm.style.width && !elm.style.width.match(/%/)) { 
			curr_w = parseInt(elm.style.width); 
		} else {
			if (OAT.Dom.isGecko() && !OAT.Dom.isOpera()) { 
				var temp_w = OAT.Dom.style(elm,"width"); 
				curr_w = (temp_w == "auto" ? elm.offsetWidth : parseInt(temp_w));
				if (elm.tagName.toLowerCase() == "input") { curr_w = curr_w + 5; }
			} else { curr_w = elm.offsetWidth; }
		}
		
		if (elm.style.height && !elm.style.height.match(/%/)) {	
			curr_h = parseInt(elm.style.height); 
		} else {
			if (OAT.Dom.isGecko() && !OAT.Dom.isOpera()) { 
				var temp_h = OAT.Dom.style(elm,"height"); 
				curr_h = (temp_h == "auto" ? elm.offsetHeight : parseInt(temp_h));
				if (elm.tagName.toLowerCase() == "input") { curr_h = curr_h + 5; }
			} else { curr_h = elm.offsetHeight; }
		}
		
		/* one more bonus - if we are getting height of document.body, take window size */
		if (elm == document.body) { 
			curr_h = (OAT.Dom.isIE() ? document.body.clientHeight : window.innerHeight); 
		}
		return [curr_w,curr_h];
	},
	
	moveBy:function(element,dx,dy) {
		var curr_x,curr_y;
		var elm = $(element);
		/*
			If the element is not anchored to left top corner, strange things will happen during resizing;
			therefore, we need to make sure it is anchored properly.
		*/
		if (OAT.Dom.style(elm,"position") == "absolute") { 
			if (!elm.style.left) {
				elm.style.left = elm.offsetLeft + "px";
				elm.style.right = "";
			}
			if (!elm.style.top) {
				elm.style.top = elm.offsetTop + "px";
				elm.style.bottom = "";
			}
		}
		var tmp = OAT.Dom.getLT(elm);
		curr_x = tmp[0];
		curr_y = tmp[1];
		var x = curr_x + dx;
		var y = curr_y + dy;
		elm.style.left = x + "px";
		elm.style.top = y + "px";
	},
	
	resizeBy:function(element,dx,dy) {
		var curr_w, curr_h;
		var elm = $(element);
		/*
			If the element is not anchored to left top corner, strange things will happen during resizing;
			therefore, we need to make sure it is anchored properly.
		*/
		if (OAT.Dom.style(elm,"position") == "absolute") { 
			if (!elm.style.left) {
				elm.style.left = elm.offsetLeft + "px";
				elm.style.right = "";
			}
			if (!elm.style.top) {
				elm.style.top = elm.offsetTop + "px";
				elm.style.bottom = "";
			}
		}
		var tmp = OAT.Dom.getWH(elm);
		curr_w = tmp[0];
		curr_h = tmp[1];
		var w = curr_w + dx;
		var h = curr_h + dy;
		elm.style.width = w + "px";
		elm.style.height = h + "px"; 
	},
	
	decodeImage:function(data) {
		var decoded = OAT.Crypto.base64d(data);
		var mime = "image/";
		switch (decoded.charAt(1)) {
			case "I": mime += "gif"; break;
			case "P": mime += "png"; break;
			case "M": mime += "bmp"; break;
			default: mime += "jpeg"; break;
			
		}
		var src="data:"+mime+";base64,"+data;
		return src;
	},
	
	removeSelection:function() {
		var selObj = false;
		if (document.getSelection && !OAT.Dom.isGecko()) { selObj = document.getSelection(); }
		if (window.getSelection) { selObj = window.getSelection(); }
		if (document.selection) { selObj = document.selection; }
		if (selObj) {
			if (selObj.empty) { selObj.empty(); }
			if (selObj.removeAllRanges) { selObj.removeAllRanges(); }
		}
	},
	
	getScroll:function() {
		if (OAT.Dom.isWebKit() || OAT.Dom.isIE()) {
			var l = document.body.scrollLeft;
			var t = document.body.scrollTop;
		} else {
			var l = Math.max(document.documentElement.scrollLeft,document.body.scrollLeft);
			var t = Math.max(document.documentElement.scrollTop,document.body.scrollTop);
		}
		return [l,t];
	},

	getFreeSpace:function(x,y) {
		var scroll = OAT.Dom.getScroll();
		var port = OAT.Dom.getViewport();
		var spaceLeft = x - scroll[0];
		var spaceRight = port[0] - x + scroll[0];
		var spaceTop = y - scroll[1];
		var spaceBottom = port[1] - y + scroll[1];
		var left = (spaceLeft > spaceRight);
		var top = (spaceTop > spaceBottom);
		return [left,top];
		
	},
	
	toSafeXML:function(str) {
		if (typeof(str) != "string") { return str; }
		return str.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;");
	},
	
	fromSafeXML:function(str) {
		return str.replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<");
	}
}
OAT.Files = { /* only those whose names differ */
	gmaps:"customGoogleLoader.js",
	ymaps:"customYahooLoader.js",
	openlayers:"OpenLayers.js",
	gapi:"gmapapi.js"
}

OAT.Loader = {
	toolkitPath:false,
	openAjax:false,
	dimmer:false,
	loadedLibs:[], /* libraries ready to be used */
	loadingLibs:[], /* libraries marked for inclusion */
	loadOccurred:0, /* was window.onload fired? */
	loadCallbacks:[], /* features & callbacks to be executed */
	
	loadFeatures:function(features,callback) { /* load all these features and execute callback */
		var allNames = OAT.Loader.makeDep(features); /* dependencies */
		/* distinct values */
		var distinct = {};
		for (var i=0;i<allNames.length;i++) if (!(allNames[i] in distinct)) { distinct[allNames[i]] = 1; }
		var loadList = []; /* list of libraries needed to include */
		for (var name in distinct) { 
			var index = OAT.Loader.loadedLibs.find(name); /* detect whether lib was already included */
			if (index == -1) { loadList.push(name);	}
		}
		if (loadList.length && OAT.Dimmer && !OAT.Loader.dimmer) {
			OAT.Loader.dimmer = 1;
			document.body.appendChild(OAT.Loader.dimmerElm);
			OAT.Dimmer.show(OAT.Loader.dimmerElm);
			OAT.Dom.center(OAT.Loader.dimmerElm,1,1);
		}
		
		OAT.Loader.loadCallbacks.push([loadList,callback]); /* all needed, not yet loaded, libs */
		var cpy = [];
		for (var i=0;i<loadList.length;i++) { cpy.push(loadList[i]); }
		for (var i=0;i<cpy.length;i++) { 
			var name = cpy[i];
			var index = OAT.Loader.loadingLibs.find(name);
			if (index == -1) { 
				var fileName = name+".js";
				if (name in OAT.Files) { fileName = OAT.Files[name]; }
				OAT.Loader.include(fileName); 
			} /* include only if not in loadingLibs list */
		}
		OAT.Loader.checkLoading();
	},
	
	featureLoaded:function(name) { /* called by libraries when they are loaded */
		OAT.Loader.loadedLibs.push(name); /* add to list of loaded */
		var index = OAT.Loader.loadingLibs.find(name); 
		OAT.Loader.loadingLibs.splice(index,1); /* remove from list of being loaded */
		for (var i=0;i<OAT.Loader.loadCallbacks.length;i++) {
			var list = OAT.Loader.loadCallbacks[i][0];
			var index = list.find(name);
			if (index != -1) { list.splice(index,1); }
		}
		OAT.Loader.checkLoading();
	},
	
	checkLoading:function() { /* check list of loaded libs against TODO list with callbacks */
		var done = []; /* indexes */
		var toExecute = [];
		for (var i=0;i<OAT.Loader.loadCallbacks.length;i++) { /* check all lists for completion */
			var list = OAT.Loader.loadCallbacks[i][0];
			if (!list.length) { /* nothing to be loaded -> execute and mark for removal */
				toExecute.push(OAT.Loader.loadCallbacks[i][1]);
				done.push(i);
			}
		}
		/* remove all executed */
		for (var i=done.length-1;i>=0;i--) {
			var index = done[i];
			OAT.Loader.loadCallbacks.splice(index,1);
		}
		if (!OAT.Loader.loadCallbacks.length && OAT.Loader.dimmer) { 
			OAT.Loader.dimmer = 0; 
			if (OAT.Loader.dimmerElm == OAT.Dimmer.elm) { OAT.Dimmer.hide(); }
		}
		for (var i=0;i<toExecute.length;i++) { toExecute[i](); }
	},
	
	startInit:function() {
		/* to be called when all initial libs are loaded. waits until 'onload' occurs and then continues */
		var ref = function() {
			if (OAT.Loader.loadOccurred) { 
				if (typeof(window._init) == "function" && typeof(document.body.getAttribute("onload")) == "object") { window._init(); } /* if _init is specified, execute */
				if (OAT.Declarative) { OAT.Declarative.execute(); } /* declarative markup */
				OAT.MSG.send(OAT,OAT.MSG.OAT_LOAD,{});
				if (typeof(window.init) == "function" && typeof(document.body.getAttribute("onload")) == "object") { window.init(); } /* pass control to userspace */
				
			} else { setTimeout(ref,200); }
		}
		setTimeout(ref,100);
	},

	include:function(file) {
		var path = OAT.Loader.toolkitPath;
		var value = (typeof(file) == "object" ? file : [file]);
		for (var i=0;i<value.length;i++) {
			var name = path+value[i];
			var script = document.createElement("script");
			script.src = name;
			// alert("including "+name);
			document.getElementsByTagName("head")[0].appendChild(script);
		}
	},

	makeDep:function(features) {
		/* create list of needed libs for this featureset */
		var arr = (typeof(features) == "object" ? features : [features]);
		var result = [];
		for (var i=0;i<arr.length;i++) {
			var f = arr[i];
			if (f != "dom") { result.push(f); } /* historical remains */
			if (f in OAT.Dependencies) { /* if has dependencies */
				var value = OAT.Dependencies[f];
				var v = (typeof(value) == "object" ? value : [value]);
				for (var j=0;j<v.length;j++) {
					result.append(OAT.Loader.makeDep(v[j]));
				}
			}
		}
		return result;
	},
	
	findPath:function() { /* scan for loader.js and OpenAjax.js */
		var head = document.getElementsByTagName("head")[0];
		var children = head.childNodes;
		for (var i=0;i<children.length;i++) {
			var s = children[i];
			if (s.nodeType != 1 || s.tagName.toLowerCase() != "script") { continue; }
			var re = false;
			if ((re = s.src.match(/^(.*)loader\.js$/))) { OAT.Loader.toolkitPath = re[1]; }
			if ((re = s.src.match(/^(.*)OpenAjax.js$/))) { OAT.Loader.openAjax = true; }
		}
	},

	startOpenAjax:function() {
		OpenAjax.registerLibrary("oat", "http://www.openlinksw.com/oat", "1.0");
		OpenAjax.registerGlobals("oat", ["OAT","featureList"]);
		OpenAjax.addOnLoad(function(){OAT.Loader.loadOccurred = 1;}, null, "library");
	},
	
	start:function() {
		OAT.Loader.findPath();
		OAT.Loader.dimmerElm = OAT.Dom.create("div",{border:"2px solid #000",padding:"1em",position:"absolute",backgroundColor:"#fff"});
		OAT.Loader.dimmerElm.innerHTML = "OAT Components loading...";
		if (OAT.Loader.openAjax) { OAT.Loader.startOpenAjax(); } else {
			OAT.Dom.attach(window,"load",function(){OAT.Loader.loadOccurred = 1;});
		}
		var fl = (window.featureList ? window.featureList : []);
		fl.push("preferences");
		OAT.Loader.loadFeatures(fl,OAT.Loader.startInit);
	}
}

/* messages */
OAT.MSG = {
	DEBUG:0,
	OAT_DEBUG:0,
	OAT_LOAD:1,
	ANIMATION_STOP:2,
	TREE_EXPAND:3,
	TREE_COLLAPSE:4,
	DS_RECORD_PREADVANCE:5,
	DS_RECORD_ADVANCE:6,
	DS_PAGE_PREADVANCE:7,
	DS_PAGE_ADVANCE:8,
	AJAX_START:9,
	AJAX_ERROR:10,
	
	registry:[],
	attach:function(sender,msg,callback) {
		if (!sender) { return; }
		OAT.MSG.registry.push([sender,msg,callback]);
	},
	detach:function(sender,msg,callback) {
		if (!sender) { return; }
		var index = -1;
		for (var i=0;i<OAT.MSG.registry.length;i++) {
			var rec = OAT.MSG.registry[i];
			if (rec[0] == sender && rec[1] == msg && rec[2] == callback) { index = i; }
		}
		if (index != -1) { OAT.MSG.registry.splice(index,1); }
	},
	send:function(sender,msg,event) {
		for (var i=0;i<OAT.MSG.registry.length;i++) {
			var record = OAT.MSG.registry[i];
			var senderOK = (sender == record[0] || record[0] == "*");
			if (!senderOK) { continue; }
			var msgOK = (msg == record[1] || record[1] == "*");
			if (!msgOK && record[1].toString().match(/\*/)) { /* try regexp match */
				var re = new RegExp(record[1]);
				var str = "";
				for (var p in OAT.MSG) {
					var v = OAT.MSG[p];
					if (v == msg) { str = p; }
				}
				if (str.match(re)) { msgOK = true; }
			} /* regexp */
			if (msgOK) { record[2](sender,msg,event); }
		} /* for all listeners */
	} /* send message */
}

OAT.Debug = {
	data:[],
	attach:function(sender,msg) {
		OAT.MSG.attach(sender,msg,OAT.Debug.listen);
	},
	listen:function(sender,msg,event) {
		var name = "n/a";
		for (var p in OAT.MSG) {
			var v = OAT.MSG[p];
			if (typeof(v) == "number" && v == msg) { name = p; }
		}
		OAT.Debug.data.push([sender,name,event]);
	}
}
OAT.Debug.attach("*","*");
//OAT.Debug.attach("*",OAT.MSG.OAT_DEBUG);

/* dependency tree */
OAT.Dependencies = {
	ajax:"crypto",
	ajax2:"crypto",
	soap:"ajax2",
	window:["mswin","macwin","roundwin","rectwin"],
	xmla:["soap","xml","connection"],
	roundwin:["drag","resize","simplefx"],
	rectwin:["drag","resize"],
	mswin:["drag","resize"],
	macwin:["drag","resize","simplefx"],
	ghostdrag:"animation",
	quickedit:"instant",
	grid:"instant",
	combolist:"instant",
	formobject:["drag","resize","datasource","tab"],
	color:"drag",
	combobutton:"instant",
	pivot:["ghostdrag","statistics","instant","barchart"],
	combobox:"instant",
	menu:"animation",
	panelbar:"animation",
	dock:["animation","ghostdrag"],
	calendar:"drag",
	graph:"canvas",
	dav:["grid","tree","toolbar","ajax2","xml"],
	dialog:["window","dimmer"],
	datasource:["jsobj","json","xml","connection","dstransport"],
	gmaps:["gapi","map"],
	ymaps:["map"],
	simplefx:"animation",
	msapi:["map","layers"],
	ws:["xml","soap","ajax2","schema","connection"],
	schema:["xml"],
	timeline:["slider","tlscale","resize"],
	piechart:"svg",
	graphsvg:["svg","graphsidebar","rdf","dereference"],
	rdf:"xml",
	anchor:["window"],
	openlayers:["map","layers","roundwin"],
	svgsparql:["svg","ghostdrag","geometry"],
	linechart:"svg",
	sparkline:"linechart",
	webclip:"webclipbinding",
	declarative:"json",
	tree:"ghostdrag",
	rdfbrowser:["rdf","tree","dereference","anchor","rdftabs","tab","dav"],
	graphsidebar:"tree",
	form:["ajax2","dialog","datasource","formobject"],
	rssreader:"xml"
}

/* 
	global loading works like this: 
	- monitor onload, just to make sure we don't initialize too early
	- load initial set of libraries
	- wait until: 1.all scripts are loaded, 2.onload occurred
	- then: 1. DOM structure is accessible
			2. event leak eliminator is attached
			3. all delayed init methods are called
			4. (if present) declarative scanner is executed
			5. userspace init() is called (if present)
*/
OAT.Loader.start();

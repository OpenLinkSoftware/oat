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
	OAT.Drag.create(clicker,mover,optObj)
	OAT.Drag.remove(clicker,mover)
	OAT.Drag.removeAll(clicker)
*/

OAT.Drag = {
	TYPE_X:1,
	TYPE_Y:2,
	TYPE_XY:3,
	elm:[],
	mouse_x:0,
	mouse_y:0,
	
	init:function() {
		OAT.Dom.attach(document,"mousemove",OAT.Drag.move);
		OAT.Dom.attach(document,"mouseup",OAT.Drag.up);
	},
	
	move:function(event) {
		if (!OAT.Drag.elm.length) return;
		var dx = event.clientX - OAT.Drag.mouse_x;
		var dy = event.clientY - OAT.Drag.mouse_y;
		for (var i=0;i<OAT.Drag.elm.length;i++) {
			var element = OAT.Drag.elm[i][0];
			var options = OAT.Drag.elm[i][1];
			var pos = OAT.Dom.getLT(element);
			if (!options.restrictionFunction(pos[0]+dx,pos[1]+dy)) {
				switch (options.type) {
					case OAT.Drag.TYPE_X: OAT.Dom.moveBy(element,dx,0); break;
					case OAT.Drag.TYPE_Y: OAT.Dom.moveBy(element,0,dy); break;
					case OAT.Drag.TYPE_XY: OAT.Dom.moveBy(element,dx,dy); break;
				} /* switch */
			} /* if not restricted */
		}
		OAT.Drag.mouse_x = event.clientX;
		OAT.Drag.mouse_y = event.clientY;
	},
	
	up:function(event) {
		OAT.Drag.elm = [];
	},

	create:function(clicker,mover,optObj) {
		var options = {
			type:OAT.Drag.TYPE_XY,
			restrictionFunction:function(){return false;}
		}
		if (optObj) for (p in optObj) { options[p] = optObj[p]; }
		var elm = $(clicker);
		var win = $(mover);
		var ref = function(event) {
			OAT.Drag.elm = elm._Drag_movers;
			OAT.Drag.mouse_x = event.clientX;
			OAT.Drag.mouse_y = event.clientY;
		}
		if (!elm._Drag_movers) { 
			OAT.Dom.attach(elm,"mousedown",ref);		
			elm._Drag_movers = [];
			elm._Drag_cursor = elm.style.cursor;
		}
		elm.style.cursor = "move";
		elm._Drag_movers.push([win,options]);
	},
	
	remove:function(clicker,mover) {
		var elm = $(clicker);
		var win = $(mover);
		if (!elm._Drag_movers) { return; }
		var index = -1;
		for (var i=0;i<elm._Drag_movers.length;i++) {
			if (elm._Drag_movers[i][0] == mover) { index = i; }
		}
		if (index == -1) { return; }
		elm._Drag_movers.splice(index,1);
	},
	
	removeAll:function(clicker) {
		var elm = $(clicker);
		if (elm._Drag_movers) { 
			elm._Drag_movers = [];
			elm.style.cursor = elm._Drag_cursor;
		}
	},
	
	createDefault:function(parent,window) {

	
		if (!OAT.Preferences.allowDefaultDrag) { return; }
		var drag = OAT.Dom.create("div",{position:"absolute",width:"21px",height:"21px",left:"-21px",top:"-21px",backgroundImage:"url(/DAV/JS/images/drag.png)"});
		parent.appendChild(drag);
		OAT.Drag.create(drag,parent);
		
		if (window) {
			drag._Drag_movers[0][1].restrictionFunction = function(l,t) {
				var dims = OAT.Dom.getWH(parent);
				var wdims = OAT.Dom.getWH(window);
				return l < 0 || t < 0 || l+dims[0]>wdims[0] || t+dims[1]>wdims[1];
			}
		}
	
		OAT.Dom.hide(drag);
		var show = function(event) {
			OAT.Dom.show(drag);
			drag._Drag_pending = 0;
		}
		var check = function() {
			if (drag._Drag_pending) {
				OAT.Dom.hide(drag);
			}
		}
		var hide = function(event) {
			drag._Drag_pending = 1;
			setTimeout(check,2000);
		}
		OAT.Dom.attach(parent,"mouseover",show);
		OAT.Dom.attach(parent,"mouseout",hide);
	}
}
OAT.Loader.loadAttacher(OAT.Drag.init);
OAT.Loader.pendingCount--;

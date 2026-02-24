
var bm_stars = {
	icon_url: 'http://fi.somethingawful.com/style/bookmarks/',
	icon_extension: 'gif',
	categories: 3,
	icons: Object(),
	do_category_colors: false,

	init: function(colorize) {
		this.do_category_colors = colorize;
		for(var i = 0; i < this.categories; i++) {
			this.icons[i] = new Image();
			this.icons[i].src = this.icon_url + 'star' + i + '.' + this.icon_extension;
		}
		this.icons['off'] = new Image();
		this.icons['off'].src = this.icon_url + 'star-off.' + this.icon_extension;
		this.icons['spin'] = new Image();
		this.icons['spin'].src = this.icon_url + 'spin3.' + this.icon_extension;
	},

	toggle: function(img, threadid) {
		img.src = this.icons['spin'].src;
		img.onclick = function() {};
		//dojo.html.getParentByType(img, 'tr').className = 'thread seen';

		dojo.io.bind({
			url: '/bookmarkthreads.php?threadid=' + threadid + '&action=cat_toggle&json=1',
			load: dojo.lang.hitch(this, function(type, res) {
				img.onclick = dojo.lang.hitch(this, function() { this.toggle(img, threadid); });
				this.set_star(img, res.category_id);
				var row = dojo.html.getParentByType(img, 'tr');
				dojo.html.removeClass(row, 'category0');
				dojo.html.removeClass(row, 'category1');
				dojo.html.removeClass(row, 'category2');
				if(res.category_id >= 0) row.className = 'category' + res.category_id + ' ' + row.className;
			}),
			error: dojo.lang.hitch(this, function(type, res) {
				img.src = this.icon_url + 'warning.gif';
				img.title = 'An error occurred while updating the bookmark!';
				//res.message
			}),
			mimetype: 'text/javascript'
		});
	},

	set_star: function(img, category_id) {
		img.title = 'Bookmark category updated!';
		img.src = (category_id >= 0) ? this.icons[category_id].src : this.icons['off'].src;
	}
}

var seen = {
	anchors: new Array(),

	get_anchor: function(node) {
		threadid = seen.get_threadid(node);
		if(seen.anchors[threadid]) {
			var a = seen.anchors[threadid];	
		} else {
			seen.anchors[threadid] = a = new seen_anchor(node);
		}
		return a;
	},

	get_threadid: function(node) {
		tr = dojo.dom.getFirstAncestorByTag(node, 'tr');
		return tr.id.substring(6);
	},

	reset: function(node) {
		var a = seen.get_anchor(node);
		if(a.is_busy()) return false;
		a.set_busy(1);

		dojo.io.bind({
			url: '/showthread.php?threadid=' + a.threadid + '&action=resetseen&json=1',
			load: dojo.lang.hitch(this, function() { a.make_unseen() }),
			error: dojo.lang.hitch(this, function(type, res) {
				alert("Failed to reset status, try again..." + type + ' ' + res);
				a.set_busy = 0;
			}),
			mimetype: 'text/javascript'
		});
	}
}

dojo.require("dojo.lang.declare");
dojo.declare('seen_anchor', null, {
	_busy: 0,
	threadid: 0,

	node: null,
	div_seen: null,

	initializer: function(node) {
		this.node = node;
		tr = this.get_parent_tr();
		this.div_seen = dojo.html.getElementsByClass('lastseen', tr)[0];
		this.threadid = tr.id.substring(6);
	},

	set_busy: function(is_busy) {
		if(is_busy) {
			this._busy = 1;
			var txt = '<';
		} else {
			this._busy = 0;
			var txt = 'X';
		}
		dojo.dom.replaceChildren(this.node, document.createTextNode(txt));
	},

	is_busy: function() {
		return (this._busy ? 1 : 0);
	},

	get_parent_tr: function() {
		return dojo.dom.getFirstAncestorByTag(this.node, 'tr');
	},

	make_unseen: function() {
		tr = this.get_parent_tr();
		dojo.html.removeClass(tr, 'seen');
		dojo.html.getElementsByClass('lastseen', tr)[0].style.display = 'none';
		this.set_busy(0);
	}
});

dojo.declare('bookmarks_button_remove', null, {
	domNode: null,
	button: null,

	initializer: function(id) {
		var td = this.domNode = document.createElement('td');
		td.className = 'button_remove';
		this.button = document.createElement('div');
		this.button.title = 'Click to delete this bookmark';
		td.appendChild(this.button);
		this.enable();
	},

	enable: function() {
		dojo.event.connect(this.button, 'onclick', dojo.lang.hitch(this, 'handle_click'));
	},

	disable: function() {
		dojo.event.connect(this.button, 'onclick', function() {});
	},

	handle_click: function(e) {
		this.disable();
		dojo.html.addClass(this.button, 'spin');
		dojo.html.removeClass(this.button, 'warn');
		var threadid = seen.get_threadid(e.currentTarget);

		dojo.io.bind({
			url: '/bookmarkthreads.php?threadid=' + threadid + '&action=remove&json=1',
			load: dojo.lang.hitch(this, function(type, res) {
				dojo.html.removeClass(this.button, 'spin');
				dojo.byId('thread' + threadid).style.display = 'none';
			}),
			error: dojo.lang.hitch(this, function(type, res) {
				dojo.html.removeClass(this.button, 'spin');
				dojo.html.addClass(this.button, 'warn');
				this.button.title = 'An error occurred while removing the bookmark!  Try again...';
				this.enable();
			}),
			mimetype: 'text/javascript'
		});
	}
});

var bookmarks_mui = {
	add_buttons: function() {
		var table = dojo.html.getElementsByClass('threadlist')[0];

		var tr_head = dojo.dom.getFirstChildElement( dojo.dom.getFirstChildElement(table, 'thead'), 'tr' );
		var th = document.createElement('th');
		th.appendChild(document.createTextNode(""));
		tr_head.appendChild(th);

		var rows = dojo.html.getElementsByClass('thread', dojo.dom.getFirstChildElement(table, 'tbody'), 'tr');
		for(var i = 0; i < rows.length; i++) {
			var button = new bookmarks_button_remove(rows[i].id);
			rows[i].appendChild(button.domNode);
		}
	},

	add_buttons_button: function() {
		var bhook = dojo.byId('bookmark_edit_attach');
		if(bhook == undefined) return;
		bhook.className = 'enabled';
		bhook.innerHTML = "Edit Bookmarks";
		bhook.title = "Click the red icon next to a bookmark to permanently remove it from the list";
		dojo.event.connect(bhook, 'onclick', dojo.lang.hitch(this, function() {
			bhook.style.display = 'none';
			this.add_buttons();
		}));
	}
}


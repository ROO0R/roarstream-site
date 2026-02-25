dojo.require("dojo.lang.declare");

var timg_watcher = {
	max_img_width: 170,
	max_img_height: 200,
	initialized: 0,

	init: function() {
		if(this.initialized) return;
		var posts = dojo.html.getElementsByClass('postbody');
		for(var i = 0; i < posts.length; i++) {
			var imgs = dojo.html.getElementsByClass('timg', posts[i], 'img');
			for(var j = 0; j < imgs.length; j++) {
				var img = imgs[j];

				var img_url = img.src;
				dojo.event.connect(img, 'onload', this, 'timg_loaded');
				img.src = img_url;

				// for some browsers, we may already know the image dimensions...
				if(img.naturalWidth !== undefined && img.naturalWidth > 0) {
					this.squash_img(img, img.naturalWidth, img.naturalHeight);
				} else {
					img.width = this.max_img_width;
				}
				dojo.html.addClass(img, 'loading');
			}
		}
		this.initialized = 1;
		return;
	},

	timg_loaded: function(evt) {
		var img = evt.currentTarget;

		var ia_w = 0; ia_h = 0;
		if(img.naturalWidth && img.naturalHeight) {
			ia_w = img.naturalWidth;
			ia_h = img.naturalHeight;
		} else {
			var dimg = new Image();
			dimg.src = img.src;
			ia_w = dimg.width;
			ia_h = dimg.height;
		}
		this.squash_img(img, ia_w, ia_h);
		var caption = ia_w + 'x' + ia_h;

		dojo.html.removeClass(img, 'loading');
		dojo.html.addClass(img, 'complete');

		var a = (img.parentNode.tagName == 'a') ? img.parentNode : document.createElement('a');
		a.href = img.src;
		a.target = '_blank';
		a.title = 'View original full-sized image';
		dojo.dom.insertAtPosition(a, img, 'before');

		if(!dojo.html.hasClass(img, 'peewee')) new timg_container(a, img, caption, ia_w, ia_h);

		/* opera fires onload again in appendChild(), so we need to disconnect */
		dojo.event.disconnect(img, 'onload', this, 'timg_loaded');
		a.appendChild(img);
		
		img.style.visibility = 'visible';
	},

	squash_img: function(img, w, h) {
		if(w && w < this.max_img_width) {
			img.width = w;
			dojo.html.addClass(img, 'peewee');
		}
		if(w > this.max_img_width) img.width = this.max_img_width;
		else if(h > this.max_img_height) img.height = this.max_img_height;
	}
};

dojo.declare('timg_container', null, {
	nodeRoot: null,
	nodeNote: null,
	nodeImg: null,
	caption: null,

	real_height: 0,
	real_width: 0,
	timg_height: 0,
	timg_width: 0,
	
	initializer: function(node, wrapped, caption, f_w, f_h) {
		this.real_width = f_w;
		this.real_height = f_h;

		this.timg_width = wrapped.width;
		this.timg_height = wrapped.height;
		this.nodeImg = wrapped;

		this.nodeRoot = document.createElement('span');
		dojo.html.addClass(this.nodeRoot, 'timg_container');

		this.resize_root(this.timg_height);

		this.nodeNote = document.createElement('div');
		dojo.html.addClass(this.nodeNote, 'note');
		this.nodeNote.innerHTML = this.caption = caption;
		this.nodeNote.style.display = 'none';
		this.nodeNote.title = 'Click to toggle size';
		this.nodeRoot.appendChild(this.nodeNote);

		dojo.dom.insertAtPosition(this.nodeRoot, node, 'before');
		node = dojo.dom.removeNode(node);
		this.nodeRoot.appendChild(node);

		dojo.event.connect(this.nodeImg, 'onmouseover', this, 'hover');
		dojo.event.connect(this.nodeImg, 'onmouseout', this, 'unhover');
		dojo.event.connect(this.nodeNote, 'onmouseout', this, 'unhover');
		dojo.event.connect(this.nodeNote, 'onclick', this, 'engorge');
	},

	resize_root: function(h) {
		this.nodeRoot.style[ document.all ? 'paddingBottom' : 'paddingTop' ] = h + 'px';
	},

	hover: function(e) {
		this.nodeNote.style.display = 'block';
	},

	unhover: function(e) {
		if(dojo.html.hasClass(e.relatedTarget, 'note')) return;
		this.nodeNote.style.display = 'none';
	},

	deflate: function(e) {
		e.stopPropagation();
		e.preventDefault();
		dojo.html.removeClass(this.nodeNote, 'expanded');
		this.resize_img(this.timg_width, this.timg_height);
		dojo.event.connect(this.nodeNote, 'onclick', this, 'engorge');
	},

	engorge: function(e) {
		e.stopPropagation();
		e.preventDefault();
		dojo.html.addClass(this.nodeNote, 'expanded');
		this.resize_img(this.real_width, this.real_height);
		dojo.event.connect(this.nodeNote, 'onclick', this, 'deflate');
	},

	resize_img: function(w, h) {
		this.nodeImg.width = w;
		this.nodeImg.height = h;
		this.resize_root(h);
	}
});

dojo.addOnLoad( timg_watcher, 'init' );


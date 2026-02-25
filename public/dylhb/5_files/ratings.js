
var ratebar = {
	img_url_base: 'http://fi.somethingawful.com/style/thread/rate/',

	rateform: undefined,
	node: undefined,

	select_vote: undefined,
	threadid: undefined,
	digg_url: undefined,

	init: function() {
		this.rateform = dojo.byId('rateform');
		if(!this.rateform) return;
		this.node = dojo.byId('rateform_js_attach');
		this.rateform.style.display = 'none';

		dojo.lang.forEach(this.rateform.elements, function(ele) {
			if(ele.name == 'vote') select_vote = ele;
			if(ele.name == 'threadid') threadid = ele.value;
			if(ele.name == 'digg_url') digg_url = ele.value;
		});

		this.select_vote = select_vote;
		this.threadid = threadid;
		this.digg_url = digg_url;

		for(i = 1; i <= 5; i++) {
			var img = this.make_ratebutton(i);
			this.node.appendChild(img);
		}
		var img = this.make_diggbutton();
		this.node.appendChild(img);
	},

	make_ratebutton: function(vote) {
		var img = document.createElement('img');
		img.src = this.img_url_base + 'rate' + vote + '.gif';
		dojo.event.connect(img, 'onclick', dojo.lang.hitch(this, function() { this.vote(vote); }));
		return img;
	},

	make_diggbutton: function() {
		var img = document.createElement('img');
		img.src = this.img_url_base + 'digg.gif';
		img.title = 'Vote this thread five and digg it!';
		dojo.event.connect(img, 'onclick', dojo.lang.hitch(this, function() { this.vote_digg(); }));
		return img;
	},

	vote_digg:function() {
		this.vote(5);
		window.open(this.digg_url, 'digg');
	},

	vote: function(value) {
		this.select_vote.value = value;
		this.display_spin();
		dojo.io.bind({
			url: '/threadrate.php',
			load: dojo.lang.hitch(this, function(type, res) {
				this.vote_success(value, res);
			}),
			error: dojo.lang.hitch(this, function(type, res) { this.vote_fail(res) }),
			mimetype: 'text/json-comment-filtered',
			method: 'post',
			headers: {
				'X-Ajax-Engine': 'Dojo/' + dojo.version
			},
			content: {
				threadid: this.threadid,
				vote: value
			}
		});
	},

	vote_success: function(vote, res) {
		if(res.error) {
			this.display_error(res.error);
			return;
		}
		this.display_ok(vote);
	},

	vote_fail: function(res) {
		this.display_error(res.error || res.msg);
	},

	display_spin: function() {
		var spin = document.createElement('b');
		spin.innerHTML = '<img src="http://fi.somethingawful.com/style/thread/rate/spin.gif"> Something is happening...';
		dojo.dom.replaceChildren(this.node, spin);
	},

	display_error: function(msg) {
		var ele = document.createElement('b');
		ele.innerHTML = '<img src="http://fi.somethingawful.com/images/warning.gif"> Vote failed: ' + msg;
		dojo.dom.replaceChildren(this.node, ele);
	},

	display_ok: function(vote) {
		var ele = document.createElement('b');
		ele.innerHTML = 'You rated this thread \'' + vote + '\'! Great job, go hog wild!';
		dojo.dom.replaceChildren(this.node, ele);
	}
};

dojo.addOnLoad(ratebar, 'init');


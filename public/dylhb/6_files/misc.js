// misc old crap

function newposts(threadid) {
	window.location.href = '/showthread.php?goto=newpost&threadid=' + threadid;
}

function who(threadid) {
	window.open(
		"misc.php?action=whoposted&threadid=" + threadid,
		"whoposted",
		"toolbar=no,scrollbars=yes,resizable=yes,width=550,height=300"
	);
}

function validate_pm(theform, pmmaxchars) {
	if (theform.message.value=="" || theform.touser.value=="") {
		alert("Please complete the recipient and message fields.");
		return false; }
	if (pmmaxchars != 0) {
		if (theform.message.value.length > (pmmaxchars/2)) {
			alert("Your message is too long.\n\nReduce your message to "+(pmmaxchars/2)+" characters.\nIt is currently "+theform.message.value.length+" characters long.");
			return false; }
		else { return true; }
	} else { return true; }
}

function confirm_newpm() {
	input_box=confirm("You have a new private message. Click OK to view it, or cancel to hide this prompt.");
	if (input_box==true) { // Output when OK is clicked
		second_box=confirm("Open in new window?\n\n(Press cancel to open in the current window.)");
		if (second_box==true) {
			window.open('private.php', 'pmnew'); 
		} else {
			window.location="private.php";
		}
	} else {
	// Output when Cancel is clicked
	// ^^ wtf is this gayness
	}
}

// select posticon on post screens
function posticon_sel(id) {
	document.vbform.iconid.item(id).checked = true;
}

// used on post form
function validate(form, maxchars) {
	var subject = form.elements.namedItem('subject');
	if(subject && form.subject.value == '') {
		alert("Please complete the subject field, shithead.");
		return false;
	}

	var message = form.elements.namedItem('message');
	if(message && form.message.value == '') {
		alert("Please complete the message field, shithead.");
		return false;
	}

	if(maxchars != 0 && message.length > maxchars) {
		alert("Your message is too long.\n\nReduce your message to " + maxchars + " characters.\nIt is currently "+form.message.value.length+" characters long.\n  Are you trying to spam?\n  If so, then STOP!");
		return false;
	}
	return true;
}

// used on post form
function checklength(theform, postmaxchars) {
	if(!postmaxchars) postmaxchars = 0;
	if (postmaxchars != 0) { message = "\nThe maximum permitted length is " + postmaxchars + " characters."; }
	else { message = ""; }
	alert("Your message is "+theform.message.value.length+" characters long."+message);
}

function rate_thread(goldenmanbabies) {
	document.rateform.vote.value = goldenmanbabies;
	document.rateform.submit();
}

function reloadCaptcha() { document.images['captcha'].src = 'captcha.php?'+Math.random(); }

function setdebug(op) {
	var form = document.debugstate;
	var data = '';
	var labels = new Array('Debug', 'Showqueries', 'Explain', 'No Caching');
	for(i=1;i<=labels.length;i++) {
		ele = form['db'+i];
		if(op == i) {
			ele.value = (ele.value == 1 ? 0 : 1);
			form['dbt'+i].value = labels[i-1] + ' ' + (ele.value == 1 ? 'ON' : 'OFF');
			form['dbt'+i].className = (ele.value == 1 ? 'on' : 'off');
		}
		data = data + ele.value;
	}
	document.cookie = 'debugstate=' + data + ';expires=Thu, 1 Jan 2010 01:01:01 UTC;';
}

function show_adpets() {
	var ids = new Array('l','r');	
	var cts = new Array(61, 61);
	for(i=0;i<ids.length;i++) {
		var img = dojo.byId('unreg_img_b' + ids[i]);
		if(!img) continue;
		var num = Math.floor(Math.random() * cts[i] + 1);
		img.src = 'http://fi.somethingawful.com/sideimages/' + ids[i] + '88/' + num + '.jpg';
		img.style.display = 'block';
	}
}

// lotame
dojo.require("dojo.lang.declare");
dojo.declare('lothelper', null, {
	clientid: 32,
	domain: 'somethingawful.crwdcntrl.net',
	behaviors: null,
	lotcc: null,
	ran: false,

	initializer: function() {
		this.behaviors = new Array();
		this.behaviors['act'] = new Array();
		this.behaviors['int'] = new Array();
		this.behaviors['med'] = new Array();
	},

	// add beh data to existing
	beh_set: function(type, b) {
		if(this.behaviors[type] === undefined) return;
		for(i = 0; i < b.length; i++) {
			this.behaviors[type].push(b[i]);
		}
	},

	// set beh data on lotcc and reset
	beh_flush: function() {
		if(this.lotcc === undefined) return;
		for(t in this.behaviors) {
			for(beh in this.behaviors[t]) {
				this.lotcc.add(t, this.behaviors[t][beh]);
			}
			this.behaviors[t] = new Array();
		}
	},
	
	exec: function(lotcc, run_now) {
		this.lotcc = lotcc;
		this.lotcc.domain = this.domain;
		this.lotcc.client = this.clientid;
		this.beh_flush();
		run_now ? this.lotcc.bcp() : this.lotcc.bcpd();
		this.ran = true;
	}
});

dojo.declare('adloader', null, {
	iframes: null,

	load_all: function() {
		this.iframes = dojo.html.getElementsByClass('adframe');
		for(i = 0; i < this.iframes.length; i++) {
			iframe = this.iframes[i];
			if(m = iframe.className.match(/adzone(\d+)/)) {
				iframe.zone_id = m[1];
				iframe.src = '/adframe.php?z=' + iframe.zone_id;
			}
		}
	},

	make_frame: function(zone, w, h) {
		document.write('<iframe frameborder="no" scrolling="no" width="' + w + '" height="' + h + '" class="adframe adzone' + zone + '"></iframe>');
	}
});
dojo.event.connect('after', window, 'onload', function() {
	al = new adloader;
	al.load_all();
});

dojo.declare('flag_rotator', null, {
	initialized: false,
	node: null,
	timer: null,
	ticktime: 60,
	forumid: 0,

	initializer: function(forumid, placeholder_node) {
		this.node = dojo.byId(placeholder_node);
		this.forumid = forumid;
		if(!this.node || this.forumid < 1) return;

		/* if the user has a cookie named 'flag_timer', assume the value is number of tick seconds for the flag rotation */
		var cookietime;
		if((cookietime = dojo.io.cookie.get('flag_timer')) > 0) this.ticktime = cookietime;
		if(this.ticktime < 1) return;
		if(this.ticktime < 15) this.ticktime = 15;

		dojo.require("dojo.lang.timing.Timer");
		this.timer = new dojo.lang.timing.Timer( this.ticktime * 1000 );
		dojo.event.connect(this.timer, 'onTick', dojo.lang.hitch(this, 'rotate'));

		this.img = document.createElement('img');
		this.img.style.display = 'none';
		this.img.className = 'flag';
		this.node.appendChild(this.img);

		this.initialized = true;
	},

	go: function() {
		if(!this.initialized) return;
		this.timer.start();
		this.rotate();
	},

	rotate: function() {
		dojo.io.bind({
			url: '/flag.php?forumid=' + this.forumid,
			mimetype: 'text/javascript',
			load: dojo.lang.hitch(this, function(type, data) {
				var obj = data['flags'][0];
				var url = 'http://fi.somethingawful.com/flags' + obj.path + '?by=' + encodeURIComponent(obj.owner);
				var title = "This flag proudly brought to you by '" + obj.owner + "' on " + obj.created;
				this.show_image(url, title);
			}),
			error: function(t, d) {}
		});
	},

	show_image: function(url, title) {
		this.img.src = url;
		this.img.title = title;
		this.img.style.display = 'block';
	}
});
dojo.addOnLoad(function() {
	var fpdiv = document.createElement('div');
	fpdiv.id = 'flag_container';
	var bdivs = dojo.html.getElementsByClassName('breadcrumbs');
	if(bdivs.length < 1) return;
	dojo.dom.insertBefore(fpdiv, bdivs[0]);
	if(typeof rotate_forumid == 'undefined') rotate_forumid = 0;
	flagro = new flag_rotator( rotate_forumid, fpdiv );
	flagro.go();
});


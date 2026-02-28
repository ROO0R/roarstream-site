//////////////////////////////////////////////////////////////////////////////////
// Client-side Reading history

////////////////////////////////////////////////
//  Polyfills

// Some older browsers don't implement Date.now

Date.now = Date.now || function() { return +new Date; };

////////////////////////////////////////////////
// Variable declarations

// maximum history size
var maxHistoryEntries = 8;

// current actual history store
var currentHistory = [];

////////////////////////////////////////////////
// Javascript util

function storageDisabled()
{
	if(typeof(Storage) !== "undefined")
	{
		try
		{
			localStorage.setItem('lpaTest', 'test');
			localStorage.removeItem('lpaTest');
		}
		catch(e)
		{
			return true;
		}
	}

	return false;
}

function storageSupported()
{
	if(typeof(Storage) !== "undefined")
	{
		if(storageDisabled())
			return false;

		return localStorage.getItem('lpaReadingListDisabled') == null;
	}
	
	return false;
}

////////////////////////////////////////////////
// state manipulation functions

function validateHistory()
{
  var historyComparator = function(a, b) {
		if(a.date > b.date) return -1; // older to the end
		if(a.date < b.date) return 1;

		return 0;
	};
	
	currentHistory.sort(historyComparator);

	for(var i=0; i < currentHistory.length; i++)
	{
		for(var j=i+1; j < currentHistory.length; j++)
		{
			if(currentHistory[i].ID == currentHistory[j].ID &&
					currentHistory[i].isUpdate == false && currentHistory[j].isUpdate == true)
			{
				// if we have an index and an update entry
				// then update the update entry's date to be above the index.
				// This way it is bumped to the start of the list and we also
				// don't replace it with the index

				currentHistory[j].date = currentHistory[i].date + 1;
			}
		}
	}
  
	currentHistory.sort(historyComparator);

	// remove duplicates in the same LP, keeping the newest
	var lps = [];
	for(var i=0; i < currentHistory.length; i++)
	{
		if($.inArray(currentHistory[i].ID,lps) >= 0)
		{
			currentHistory.splice(i,1);
			i--;
		}
		else
		{
			lps.push(currentHistory[i].ID);
		}
	}

	// trim off entries until we have at most N
	while(currentHistory.length > maxHistoryEntries)	currentHistory.pop();
}

function clearHistory()
{
	if(!storageSupported()) return;

	localStorage.removeItem('lpaReadingList');
	currentHistory = [];
}

function enableHistory(enable)
{
	if(typeof(Storage) !== "undefined")
	{
		if(enable == false)
		{
			localStorage.lpaReadingListDisabled = true;
			localStorage.removeItem('lpaReadingList');
		}
		else
		{
			localStorage.removeItem('lpaReadingListDisabled');
		}
	}
}

function saveHistory()
{
	if(!storageSupported()) return;

	validateHistory();
	localStorage.lpaReadingList = JSON.stringify(currentHistory);
}

function loadHistory()
{
	currentHistory = [];

	if(!storageSupported()) return;

	if(typeof(localStorage.lpaReadingList) !== "undefined")
	{
		try
		{
			currentHistory = JSON.parse(localStorage.lpaReadingList);

			if( Object.prototype.toString.call( currentHistory ) != '[object Array]' ) {
				currentHistory = [];
				return;
			}

			for(var i=0; i < currentHistory.length; i++)
			{
				if(!('title' in currentHistory[i]) ||
					 !('link' in currentHistory[i]) ||
					 !('date' in currentHistory[i]) ||
					 !('ID' in currentHistory[i]) ||
					 !('isUpdate' in currentHistory[i]))
				{
					currentHistory = [];
					return;
				}
			}
		}
		catch(e)
		{
			currentHistory = [];
		}
	}
}

////////////////////////////////////////////////
// History modification

function addHistoryEntry(title, link, ID, isUpdate)
{
	var newEntry = { 'title': title, 'link': link, 'ID': ID, 'date': Date.now(), 'isUpdate': isUpdate };

	currentHistory.push(newEntry);

	// save does an implicit validate
	saveHistory();

	return newEntry;
}

////////////////////////////////////////////////
// Display

function getEmptyHistoryMessage()
{
  var greetings = [
    "Hello, you!", "Charmed, I'm sure!", "Nice to meet you!", "Oh, hello!", "Do come in!"
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)] + " I'm your Reading List, and I'll automatically keep track of which LPs you've been reading so you'll never lose your place.";
}

function getHistoryNotSupportedMessage()
{
  return "Sorry to bother you, but your browser is <em>REALLY OLD</em>. We can't guarantee things'll work properly, if at all, and we recommend you <a href=\"https://www.mozilla.org/en-GB/firefox/\">upgrade</a> as soon as possible.";
}

function addHistoryItems()
{
	$("ul.lp-history-list").children().remove();
	
	$.each(currentHistory, function(idx, a) {
	  $("ul.lp-history-list").append('<li><a href="' + a.link + '">' + a.title + '</a></li>');
	});
}

function displayCurrentHistory()
{
	if(!storageSupported()) return;

	if(currentHistory.length == 0)
	{
		$("ul.lp-history-list").html("<li class=\"lp-history-new-item\">" + getEmptyHistoryMessage() + "</li>");

		setTimeout("triggerTransitions()", 1);
	}
	else
	{
		addHistoryItems();
	}
}

function displayNewHistoryEntry(entry)
{
	$("ul.lp-history-list").prepend('<li class="lp-history-new-item"><a href="' + entry.link + '">' + entry.title + '</a></li>');

	setTimeout("triggerTransitions()", 1);
}

function triggerTransitions()
{
	$("li.lp-history-new-item").removeClass("lp-history-new-item");
}

////////////////////////////////////////////////
// Document hooks 

function displayUpdatedHistory()
{
	if(!storageSupported()) return;

	if(currentHistory.length > 0 && currentHistory[0].title == historyTitle)
	{
		displayCurrentHistory();
		return;
	}

	var addedEntry = addHistoryEntry(historyTitle, window.location.pathname, lpid, historyUpdate);

	if(currentHistory[0].title == addedEntry.title)
	{
		var entry = currentHistory.shift();

		addHistoryItems();

		currentHistory.unshift(entry);

		displayNewHistoryEntry(entry);
	}
	else
	{
		displayCurrentHistory();
	}
}

function historyHandlers()
{
	if(!storageSupported())
	{
		if(storageDisabled()) {
  		$("div.header").addClass("header-collapsed");
		} else {
  		$("div.header").prepend('<div class="banner-message" id="lphistory">' + getHistoryNotSupportedMessage() + '</div>');
    }

		return;
	}

	$("div.header").prepend('<div class="lp-history" id="lphistory">' +
														'<strong class="lp-history-title">Your Reading List</strong>' +
														'<ul class="lp-history-list"><li></li></ul>' +
														'</div>');

	$("strong.lp-history-title").attr("title", "Click to expand and view your full reading list").click(function() { $(this).parent().toggleClass("lp-history-expanded"); });

	loadHistory();
}

$(document).ready(historyHandlers);


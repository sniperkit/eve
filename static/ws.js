window.onload = function () {

    var bots = document.getElementsByClassName("bot")
    var conn;
    var msg = document.getElementById("msg");
    var log = document.getElementById("log");
    var form = document.getElementById("form");
    var sendBtn = document.getElementById("send");
	
	var noBotsAvail = false;
	
	
	
	function checkNewUser() {
		var botsAr = document.getElementsByClassName("bot");
		var bots = botsAr[0];
		
		if (bots == null) {
			showPopup('popup');
			contentAr = document.getElementsByClassName("content");
			contentEl = contentAr[0];
			contentEl.innerHTML = "";
			contentEl.style["background-image"] = "url('/static/bgpattern.png')";
			contentEl.style["background-repeat"] = "repeat";
			noBotsAvail = true;
		}
	}
	
	checkNewUser();
	
	if (noBotsAvail != true) {
	
    msg.onkeypress = function (key) {
        // send message on press enter
        if (key.keyCode === 13 && !key.shiftKey) {
            sendMsg()
            return false;
        }
    }

    function appendChat(item, sender) {
        log.appendChild(toMsg(item, sender));
        scrollChatToBottom();
    }

    function toMsg(text, style) {
        var item = document.createElement("p");
        var time = new Date()
        var mytime = time.getHours()+":"+time.getMinutes();
        item.innerHTML = "<p class=\"msg " + style + "\">" + text +"<span class=\"timestamp\">"+mytime+"</span>"+"</p>";
        return item
    }
    form.onsubmit = function () {
        sendMsg()
        return false
    };

    function sendMsg() {
        if (!conn || locked) {
            return;
        }
        if (!msg.value || msg.value.trim().length < 1) {
            return;
        }
        var message = escapeHtml(msg.value).trim()
        var activeBot = document.getElementById("bot-active")
        if (!activeBot)
            return
        var botID = parseInt(activeBot.getAttribute("botID"))
        appendChat(message, "user")
        var request = {
            "message": message,
            "bot": botID
        }
        conn.send(JSON.stringify(request));
        msg.value = "";
        lock();
        return;
    }

    var locked = false
    function lock(){
        sendBtn.disabled = true;
        locked = true
    }
    function unlock(){
        sendBtn.disabled = false;
        locked = false
    }

    if (window["WebSocket"]) {
        conn = new WebSocket("ws://" + document.location.host + "/ws");
        conn.onclose = function (evt) {
            appendChat("Ich bin dann mal im Flugmodus... Bis demnächst!", "bot");
			showPopup("disconnectpopup");
        };
        conn.onmessage = function (evt) {
            var messages = evt.data.split('\n');
            for (var i = 0; i < messages.length; i++) {
                appendChat(messages[i], "bot");
            }
            unlock();
        };
    } else {
        appendChat("<b>Your browser does not support WebSockets.</b>", "bot");
    }

    function escapeHtml(html) {
        var text = document.createTextNode(html);
        var p = document.createElement('p');
        p.appendChild(text);
        return p.innerHTML;
    }

    function changeActiveBot(newActive) {
        var active = document.getElementById("bot-active")
        if (active == newActive)
            return
        // remove is there allready is a active one
        active && active.removeAttribute("id")
        newActive.setAttribute("id", "bot-active")
        document.getElementById("log").innerHTML = ""
        var botID = parseInt(newActive.getAttribute("botid"))
        for (var index in messages[botID]) {
            var msg = messages[botID][index]
            appendChat(msg["Content"], msg["Sender"] === 1 ? "user" : "bot")
        }
    }

    function scrollChatToBottom() {
        var doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
        log.scrollTop = log.scrollHeight - log.clientHeight;
    }
	
    scrollChatToBottom();
	
	}
};

var sex = 1;
var picID = 0;
var nameID = 0;

var noBotsAvail = false;
var popupDidLoad = false;
var imageListDidLoad = -1;


	function showPopup(id) {
		var popup = document.getElementById(id);
		var contentAr = document.getElementsByClassName("content");
		var content = contentAr[0];
		var blurstrength = 3;
		
		if (popupDidLoad == false && id == 'popup') {
			popupDidLoad = true;
			//Initialize picture and name for bot creation
			genName();
			genImage();
		}
		
		var hidebutton = document.getElementById('hidePopupButton');
		var botsAr = document.getElementsByClassName("bot");
		var bots = botsAr[0];
		if (bots == null) noBotsAvail = true;
		if (noBotsAvail == true && id == 'popup') {
			hidebutton.style["visibility"] = "hidden";
		} else {
			hidebutton.style["visibility"] = "visible";
		}
		
		if (id == 'disconnectpopup') {
			blurstrength = 1.5;
		}
		
		//Show popup
		popup.style["visibility"] = "visible";
		popup.style["display"] = "block";
		
		//Change background (disable interaction)
		content.style["pointer-events"] = "none";
		content.style["-webkit-touch-callout"] = "none";
		content.style["-webkit-user-select"] = "none";
		content.style["-khtml-user-select"] = "none";
		content.style["-moz-user-select"] = "none";
		content.style["-ms-user-select"] = "none";
		content.style["user-select"] = "none";
		//Change background (apply blur)
		content.style["filter"] = "progid:DXImageTransform.Microsoft.Blur(PixelRadius='"+blurstrength+"')";
		content.style["-webkit-filter"] = "url(#blur-filter)";
		content.style["filter"] = "url(#blur-filter)";
		content.style["-webkit-filter"] = "blur("+blurstrength+"px)";
		content.style["filter"] = "blur("+blurstrength+"px)";
		
		//Click background to dismiss
		if (noBotsAvail != true && id != 'disconnectpopup') {
			leave = document.getElementById("invisibleDismissContainer");
			leave.style["visibility"] = "visible";
			leave.setAttribute('onclick','hidePopup("'+id+'")');
		}
	}
	
	function hidePopup(id) {
		var popup = document.getElementById(id);
		var contentAr = document.getElementsByClassName("content");
		var content = contentAr[0];
		
		//Hide popup
		popup.style["visibility"] = "";
		popup.style["display"] = "";
		
		//Change background (enable interaction)
		content.style["pointer-events"] = "";
		content.style["-webkit-touch-callout"] = "";
		content.style["-webkit-user-select"] = "";
		content.style["-khtml-user-select"] = "";
		content.style["-moz-user-select"] = "";
		content.style["-ms-user-select"] = "";
		content.style["user-select"] = "";
		//Change background (remove blur)
		content.style["filter"] = "";
		content.style["-webkit-filter"] = "";
		
		//Hide Click to dismiss
		leave = document.getElementById("invisibleDismissContainer");
		leave.style["visibility"] = "hidden";
	}
	
	function showChangeImagePopup() {
		hidePopup('popup');
		showPopup('imagepopup');
		
		
		if (imageListDidLoad == -1 || imageListDidLoad != sex) {
		var imagesarea = document.getElementById("imagepopupcontainer");
		
		imagesarea.innerHTML = "";
		
		//Fetch JSON of all images
		var xmlhttp = new XMLHttpRequest();
		var url = `./getImages?sex=`+sex;
		
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var result = JSON.parse(this.responseText);
				
				//TESTING: uncomment the following line and comment the if-statements
				//result = JSON.parse('[{"ImageID":"0","Path":"https://i.imgur.com/ru8D0SC.jpg"},{"ImageID":"1","Path":"https://i.imgur.com/WWQrYvd.jpg"},{"ImageID":"3","Path":"https://i.imgur.com/M7iNM4D.png"}]');
				
				for(key in result) {
					if(result.hasOwnProperty(key)) {
						var item = document.createElement("button");
						item.setAttribute('onclick','setImage('+result[key].ImageID+', "'+result[key].Path+'")');
						item.style["background-image"] = "url("+result[key].Path+")";
						imagesarea.appendChild(item);
					}
				}
				
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
		imageListDidLoad = sex;
		}
	}
	
	function genName() {
		var xmlhttp = new XMLHttpRequest();
		var url = `./getRandomName?sex=`+sex;
		
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var result = JSON.parse(this.responseText);
				setNameOnCreation(result.Text);
				nameID = result.ID;
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}
	
	function genImage() {
		var xmlhttp = new XMLHttpRequest();
		var url = `./getRandomImage?sex=`+sex;
		
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var result = JSON.parse(this.responseText);
				setImage(result.ImageID, result.Path);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}
	
	function setNameOnCreation(newName) {
		var namefield = document.getElementById("generatedName");
		namefield.innerHTML = newName+"<button onclick='genName()'></button>";		
	}
	
	function setImage(id, url) {
		picID = id;
		var imagebutton = document.getElementById("imageinput");
		imagebutton.style["background-image"] = "url("+url+")";
		hidePopup("imagepopup");
		showPopup("popup");
	}
	
	function fetchSex() {
		//Fetch selected sex
		if (document.getElementById("switch_left").checked) {
			sex = 1;
		} else {
			sex = 0;
		}
	}
	
	function onSexChange() {
		sexOld = sex;
		fetchSex();
		if (sexOld != sex) {
		genName();
		genImage();
		}
	}
	
	function submitBotCreation() {
		post("/createBot"/*"http://httpbin.org/post"*/, {nameID: nameID, imageID: picID, sex: sex});
	}
	
	function post(path, params, method) {
		method = method || "post"; // Set method to post by default if not specified.
		
		// The rest of this code assumes you are not using a library.
		// It can be made less wordy if you use one.
		var form = document.createElement("form");
		form.setAttribute("method", method);
		form.setAttribute("action", path);
		
		for(var key in params) {
			if(params.hasOwnProperty(key)) {
				var hiddenField = document.createElement("input");
				hiddenField.setAttribute("type", "hidden");
				hiddenField.setAttribute("name", key);
				hiddenField.setAttribute("value", params[key]);
				
				form.appendChild(hiddenField);
			}
		}
		
		document.body.appendChild(form);
		form.submit();
	}
	
	function showSidebar() {
		var leftWidthElementAr = document.getElementsByClassName("chat-list");
		var leftWidthElement = leftWidthElementAr[0];
		var leftBarAr = document.getElementsByClassName("topBar");
		var leftBar = leftBarAr[0];
		var leftListAr = document.getElementsByClassName("bot-list");
		var leftList = leftListAr[0];
		
		leftWidthElement.style["width"] = "60%";
		leftWidthElement.style["min-width"] = "325px";
		leftWidthElement.style["z-index"] = "1000";
		leftWidthElement.style["background-color"] = "white";
		leftBar.style["visibility"] = "visible";
		leftList.style["visibility"] = "visible";
	}
	
	function hideSidebar() {
		var leftWidthElementAr = document.getElementsByClassName("chat-list");
		var leftWidthElement = leftWidthElementAr[0];
		var leftBarAr = document.getElementsByClassName("topBar");
		var leftBar = leftBarAr[0];
		var leftListAr = document.getElementsByClassName("bot-list");
		var leftList = leftListAr[0];
		
		leftWidthElement.style["width"] = "";
		leftWidthElement.style["min-width"] = "";
		setTimeout(function() {
			leftWidthElement.style["z-index"] = "";
			leftWidthElement.style["background-color"] = "";
			leftBar.style["visibility"] = "";
			leftList.style["visibility"] = "";
		},500);
	}
	
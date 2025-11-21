let uname       = sessionStorage.username;
let password    = sessionStorage.password;
let settings    = false;
let serverData  = "";

if (!uname) {
    window.location.replace("/notallowed");
}

getMessages(true);

// 3 second poll
const pollInterval = setInterval(updateWindow, 3000);

document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13 && !settings) {
        sendMessage();
    }
});

function updateWindow() {
    if (!settings) {
        getMessages(false);
    }
}

async function sendMessage() {

    let serverData = "";
    let name       = window.location.href.split("/");
    name           = name[name.length - 1];
    name           = name.trim();
    let msg        = document.getElementById("message").value;

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Tell server to add a message
    const res = await fetch(`/msg?u=${uname}&p=${password}&s=${name}&m=${encodeURIComponent(msg)}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    serverData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (serverData != "0") {

        getMessages();
        document.getElementById("message").value = "";

    } else {
        window.location.replace("/404");
    }

}

async function getMessages() {
    
    let name        = window.location.href.split("/");
    name            = name[name.length - 1];
    name            = name.trim();
    let wasAtBottom = document.getElementById("chat").scrollTop == document.getElementById("chat").scrollHeight - document.getElementById("chat").offsetHeight;
    document.title = `BlueChat - ${name}`;

    document.getElementById("message").style.display = "block";
    document.getElementById("chat")   .style.height  = "calc(100vh - 155px)";

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Get chat server data from server
    const res = await fetch(`/sdata?u=${uname}&p=${password}&s=${name}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    serverData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (serverData != "0" && serverData != "1") {

        // if (!JSON.parse(serverData).whitelist.includes(sessionStorage.username) && JSON.parse(serverData).method == "whitelist") {
        //     window.location.replace("/notallowed");
        // }
        // if (JSON.parse(serverData).blacklist.includes(sessionStorage.username) && JSON.parse(serverData).method == "blacklist") {
        //     window.location.replace("/notallowed");
        // }

        console.log(serverData);

        document.getElementById("name").textContent = JSON.parse(serverData).name;
        document.getElementById("desc").innerHTML   = JSON.parse(serverData).description;
        document.getElementById("chat").innerHTML   = "";

        if (sessionStorage.username == JSON.parse(serverData).owner) {
            document.getElementById("sbutton").innerHTML = 'Settings';
            document.getElementById("sbutton").onclick   = () => { serverSettings(); };
        }
        
        // Voodoo evil javascript magic
        let currentName  = "";
        let currentTime  = 0;
        let currentYear  = "";
        let currentMonth = "";
        let currentDay   = "";
        for (var i = 0; i < JSON.parse(serverData).messages.length; i++) {

            let d = document.createElement("div");
            let t = new Date(JSON.parse(serverData).messages[i].time);
            

            if (JSON.parse(serverData).messages[i].username != currentName || JSON.parse(serverData).messages[i].time >= currentTime + 300000) {
                d.innerHTML += '<div style="margin: 10px;"></div>';
                let timeStr = "";
                if (t.getFullYear() != currentYear) {
                    timeStr = t.customFormat("#DDD# #MM#/#DD#/#YY# #h#:#mm# #ampm#");
                } else if (t.getMonth() != currentMonth) {
                    timeStr = t.customFormat("#DDD# #MM#/#DD#/#YY# #h#:#mm# #ampm#");
                } else if (t.getDay() != currentDay) {
                    timeStr = t.customFormat("#DDD# #MM#/#DD#/#YY# #h#:#mm# #ampm#");
                } else {
                    timeStr = t.customFormat("#h#:#mm# #ampm#");
                }
                d.innerHTML += `<p style="padding: 0px;"><a href="/user/${JSON.parse(serverData).messages[i].username}" class="clear" style="font-weight: bold; padding: 5px;">${JSON.parse(serverData).messages[i].username}</a> <span style="color: gray; font-size: 12px;">${timeStr}</span></p>`;
                //currentTime  = t.getMilliseconds();
                currentYear  = t.getFullYear();
                currentMonth = t.getMonth();
                currentDay   = t.getDay();
            }
        
            d.innerHTML += `<p style="padding: 5px;">${escapeHtml(JSON.parse(serverData).messages[i].message)}</p>`;
            //d.children.item(0).textContent = `${JSON.parse(serverData).messages[i].message}`;

            //d.innerHTML += '<div style="margin: 5px;"></div>';

            document.getElementById("chat").appendChild(d);

            currentName = JSON.parse(serverData).messages[i].username;
            currentTime = JSON.parse(serverData).messages[i].time;

        }

        if (wasAtBottom || firstTimes) {
            document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
        }

    } else {
        if (serverData == "1") {
            window.location.replace("/notallowed");
        } else {
            window.location.replace("/404");
        }
    }

}

async function leaveServer() {

    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();

    // Tell the server to leave a chat server and get the response
    const res = await fetch(`/lserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${name}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    userData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (userData != "0") {
        clearInterval(pollInterval);
        window.location.replace(`../user/${sessionStorage.username}`);
    } else {
        window.location.replace("/404");
    }
    
}

async function serverSettings() {

    settings = true;
    showSetting();
    
}

function showSetting() {

    document.getElementById("chat").scrollTop = 0;

    let name   = window.location.href.split("/");
    name       = name[name.length - 1];
    name       = name.trim();
    let desc   = JSON.parse(jsonEscape(serverData)).description;
    let method = JSON.parse(jsonEscape(serverData)).method;
    let wList  = jsonCommaUnescape(JSON.stringify(JSON.parse(jsonEscape(serverData)).whitelist));
    let bList  = jsonCommaUnescape(JSON.stringify(JSON.parse(jsonEscape(serverData)).blacklist));

    document.getElementById("message").style.display = "none";
    document.getElementById("chat")   .style.height  = "calc(100vh - 125px)";

    document.getElementById("sbutton").innerHTML = 'Apply';
    document.getElementById("sbutton").onclick   = () => { applySettings(); };

    document.getElementById("chat").innerHTML  = `<h1 id="name" style="font-size: 50px;">${name} Settings</h1>`;
    document.getElementById("chat").innerHTML += `<p style="font-size: 20px; margin-top: 25px;">Description</p>`;
    document.getElementById("chat").innerHTML += `<textarea class="desc" id="editdesc" style="margin-left: 5px; height: 27.5px" placeholder="Enter a description..." rows="1">${desc}</textarea>`;
    document.getElementById("chat").innerHTML += `<div style="margin: 25px;"></div>`;
    document.getElementById("chat").innerHTML += `<p style="font-size: 20px; margin-top: 25px;">Authorization</p>`;
    document.getElementById("chat").innerHTML += `<p style="font-size: 15px;">List to use: <select class="drop" id="listdrop" name="Authorization List Dropdown">
                                                    <option value="whitelist">Whitelist</option>
                                                    <option value="blacklist">Blacklist</option>
                                                  </select></p>`;
    document.getElementById("chat").innerHTML += `<p style="font-size: 15px;">Whitelist:</p>`
    document.getElementById("chat").innerHTML += `<textarea class="desc" id="editwlist" style="margin-left: 5px;" placeholder="Enter usernames on the whitelist..." rows="3">${wList}</textarea>`;
    document.getElementById("chat").innerHTML += `<p style="font-size: 15px;">Blacklist:</p>`
    document.getElementById("chat").innerHTML += `<textarea class="desc" id="editblist" style="margin-left: 5px;" placeholder="Enter usernames on the blacklist..." rows="3">${bList}</textarea>`;

    document.getElementById("listdrop").value = method;

}

async function applySettings() {

    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();

    let desc   = document.getElementById("editdesc").value;
    let method = document.getElementById("listdrop").value;
    let list   = "";
    if (method == "whitelist") {
        list = jsonCommaEscape(document.getElementById("editwlist").value);
    } else if (method == "blacklist") {
        list = jsonCommaEscape(document.getElementById("editblist").value);
    } 
    
    // Tell the server to edit the settings of a chat server and get the response
    const res = await fetch(`/eserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${name}&d=${encodeURIComponent(jsonUnescape(desc))}&m=${encodeURIComponent(method)}&l=${encodeURIComponent(list)}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    serverData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (serverData != "0") {
        window.location.replace(`/server/${name}`);
    } else {
        window.location.replace("/404");
    }

}

function sanitized(text) {

    const regex = /([A-Z]|[a-z]|[0-9]|_)*/gi;

    return text.replaceAll(regex, "") == "" && text != "";

}

function jsonEscape(str)  {
    return str.replace(/\n/g, "\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
}

// This is a goated method name
function jsonUnescape(str)  {
    return str.replace(/\\n/g, "\n").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}

// I should really refactor ts
function jsonCommaEscape(str) {
    return str.replace(/\n/g, ",");
}

function jsonCommaUnescape(text) {
    return text.replace(/,/g, "\n").replace(/"/g, "").replace("[", "").replace("]", "");
}

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
};

//*** This code is copyright 2002-2016 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
//*** Reuse or modification is free provided you abide by the terms of that license.
//*** (Including the first two lines above in your source code satisfies the conditions.)

// Include this code (with notice above ;) in your library; read below for how to use it.

Date.prototype.customFormat = function(formatString){
	var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
	var dateObject = this;
	YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
	MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
	MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
	DD = (D=dateObject.getDate())<10?('0'+D):D;
	DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
	th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
	formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

	h=(hhh=dateObject.getHours());
	if (h==0) h=24;
	if (h>12) h-=12;
	hh = h<10?('0'+h):h;
  hhhh = hhh<10?('0'+hhh):hhh;
	AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
	mm=(m=dateObject.getMinutes())<10?('0'+m):m;
	ss=(s=dateObject.getSeconds())<10?('0'+s):s;
	return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}
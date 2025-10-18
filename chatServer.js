let uname       = sessionStorage.username;
let password    = sessionStorage.password;
let settings    = false;
let serverData  = "";

if (!uname) {
    window.location.replace("/notallowed");
}

getMessages(true);

const pollInterval = setInterval(updateWindow, 5000);

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

async function sendMessage(firstTime) {

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

        for (var i = 0; i < JSON.parse(serverData).messages.length; i++) {

            let d        = document.createElement("div");
            d.innerHTML += `<p style="padding: 0px;"><a href="/user/${JSON.parse(serverData).messages[i].username}" class="clear" style="font-weight: bold; padding: 5px;">${JSON.parse(serverData).messages[i].username}</a></p>`;
            d.innerHTML += `<p style="padding: 5px;">${JSON.parse(serverData).messages[i].message}</p>`;
            d.innerHTML += '<div style="margin: 10px;"></div>';

            document.getElementById("chat").appendChild(d);

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

    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();
    let desc = JSON.parse(jsonEscape(serverData)).description;

    document.getElementById("message").style.display = "none";
    document.getElementById("chat")   .style.height  = "calc(100vh - 135px)";

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
                                                  </select></p>`

}

async function applySettings() {

    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();

    let desc = document.getElementById("editdesc").value;
    
    // Tell the server to edit the settings of a chat server and get the response
    const res = await fetch(`/eserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${name}&d=${encodeURIComponent(jsonUnescape(desc))}`);
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
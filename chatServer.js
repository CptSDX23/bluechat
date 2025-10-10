if (!localStorage.username) {
    window.location.replace("/notallowed");
}

getMessages();

const pollInterval = setInterval(getMessages, 5000);

document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
});

async function sendMessage() {

    let serverData = "";
    let username   = localStorage.username;
    let name       = window.location.href.split("/");
    name           = name[name.length - 1];
    name           = name.trim();
    let msg        = document.getElementById("message").value;

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Tell server to add a message
    const res = await fetch(`/msg?u=${username}&s=${name}&m=${encodeURIComponent(msg)}`);
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
    
    let serverData  = "";
    let name        = window.location.href.split("/");
    name            = name[name.length - 1];
    name            = name.trim();
    let wasAtBottom = document.getElementById("chat").scrollTop == document.getElementById("chat").scrollHeight - document.getElementById("chat").offsetHeight;

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Get chat server data from server
    const res = await fetch(`/sdata?u=${name}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    serverData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (serverData != "0") {

        if (!JSON.parse(serverData).whitelist.includes(localStorage.username)) {
            window.location.replace("/notallowed");
        }

        console.log(serverData);

        document.getElementById("name").textContent = JSON.parse(serverData).name;
        document.getElementById("desc").textContent = JSON.parse(serverData).description;
        document.getElementById("chat").innerHTML   = "";

        if (localStorage.username == JSON.parse(serverData).owner) {
            document.getElementById("desc").innerHTML += '<br><a class="clearline" href="#">Edit</a>';
        }

        for (var i = 0; i < JSON.parse(serverData).messages.length; i++) {

            let d        = document.createElement("div");
            d.innerHTML += `<p style="padding: 0px;"><a href="/user/${JSON.parse(serverData).messages[i].username}" class="clear" style="font-weight: bold; padding: 5px;">${JSON.parse(serverData).messages[i].username}</a></p>`;
            d.innerHTML += `<p style="padding: 5px;">${JSON.parse(serverData).messages[i].message}</p>`;
            d.innerHTML += '<div style="margin: 10px;"></div>';

            document.getElementById("chat").appendChild(d);

        }

        if (wasAtBottom) {
            document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
        }

    } else {
        window.location.replace("/404");
    }

}

function sanitized(text) {

    const regex = /([A-Z]|[a-z]|[0-9]|_)*/gi;

    return text.replaceAll(regex, "") == "" && text != "";

}
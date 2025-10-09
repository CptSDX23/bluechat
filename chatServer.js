run();

async function run() {
    
    let serverData = "";
    let name       = window.location.href.split("/");
    name           = name[name.length - 1];
    name           = name.trim();

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Tell the server to log in and get the response
    const res = await fetch(`/sdata?u=${name}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    serverData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (serverData != "0") {

        console.log(serverData);

        document.getElementById("name").textContent = JSON.parse(serverData).name;
        document.getElementById("desc").textContent = JSON.parse(serverData).description;

        for (var i = 0; i < JSON.parse(serverData).messages.length; i++) {

            let d        = document.createElement("div");
            d.innerHTML += `<p style="padding: 0px;"><a href="/user/${JSON.parse(serverData).messages[i].username}" class="clear" style="font-weight: bold; padding: 5px;">${JSON.parse(serverData).messages[i].username}</a></p>`;
            d.innerHTML += `<p style="padding: 5px;">${JSON.parse(serverData).messages[i].message}</p>`;
            d.innerHTML += '<div style="margin: 10px;"></div>';

            document.getElementById("chat").appendChild(d);

        }

        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;

    } else {
        window.location.replace("/404");
    }

}

function resizeChat() {



}

function sanitized(text) {

    const regex = /([A-Z]|[a-z]|[0-9]|_)*/gi;

    return text.replaceAll(regex, "") == "" && text != "";

}
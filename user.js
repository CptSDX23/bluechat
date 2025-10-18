let userData = "";

getUser();

async function getUser() {
    
    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    // Tell the server to log in and get the response
    const res = await fetch(`/udata?u=${name}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    userData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (userData != "0") {

        console.log(userData);

        document.getElementById("servers").innerHTML = '<p>Loading...</p>';

        let btn = "";
        if (sessionStorage.getItem("username") == JSON.parse(jsonEscape(userData)).username) {
            btn = '<button class="button3" onclick="logout()" style="float: right;">Log Out</button>';
            let b       = document.createElement("button");
            b.className = "button3";
            b.innerHTML = "Add Server";
            b.onclick   = () => { addServer(); };
            document.getElementById("servers").appendChild(b);
        }

        document.getElementById("name").innerHTML = JSON.parse(jsonEscape(userData)).username + btn;
        document.getElementById("desc").innerHTML = jsonUnescapeHTML(JSON.parse(jsonEscape(userData)).description);

        for (var i = 0; i < JSON.parse(jsonEscape(userData)).servers.length; i++) {
            let s       = document.createElement("p");
            s.innerHTML = `<a class="clearline" href="/server/${JSON.parse(jsonEscape(userData)).servers[i]}">${JSON.parse(jsonEscape(userData)).servers[i]}</a>`
            document.getElementById("servers").appendChild(s);
        }

        document.getElementById("servers").removeChild(document.getElementById("servers").firstElementChild);

        if (sessionStorage.getItem("username") == JSON.parse(jsonEscape(userData)).username) {
            document.getElementById("desc").innerHTML += '<br><br><a class="clearline" onclick="changeDescription()">Edit</a>';  
        }

    } else {
        window.location.replace("/404");
    }

}

function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
    window.location.replace("/");
}

function changeDescription() {
    let desc = JSON.parse(jsonEscape(userData)).description;
    document.getElementById("desc").innerHTML  = `<textarea class="desc" placeholder="Enter a description..." rows="3">${desc}</textarea>`;
    document.getElementById("desc").innerHTML += '<br><br><a class="clearline" onclick="applyDescription()">Apply</a>';  
}

async function applyDescription() {

    let newDesc = document.getElementById("desc").children.item(0).value;
    console.log(newDesc);

    // Tell the server to change the description and get the response
    const res = await fetch(`/udesc?u=${sessionStorage.username}&p=${sessionStorage.password}&d=${encodeURIComponent(jsonUnescape(newDesc))}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    userData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (userData != "0") {
        getUser();
    } else {
        window.location.replace("/404");
    }

}

async function addServer() {
    
    // Tell the server to add a chat server and get the response
    const res = await fetch(`/aserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${"ITOAGeneral"}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    userData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (userData != "0") {
        getUser();
    } else {
        window.location.replace("/404");
    }

}

function sanitized(text) {
    return text.replaceAll(/([A-Z]|[a-z]|[0-9]|_)*/gi, "") == "" && text != "";
}

function jsonEscape(str)  {
    return str.replace(/\n/g, "\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
}

// This is a goated method name
function jsonUnescape(str)  {
    return str.replace(/\\n/g, "\n").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}

// This is a goated method name too
function jsonUnescapeHTML(str)  {
    return str.replace(/\n/g, "<br>").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}
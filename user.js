let userData = "";

getUser();

async function getUser() {
    
    let name = window.location.href.split("/");
    name     = name[name.length - 1];
    name     = name.trim();

    if (!sanitized(name)) {
        window.location.replace("/404");
    }

    document.title = `BlueChat - ${name}`;

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
            b.innerHTML = "Join";
            b.style     = "float: right; height: 40px; width: 100px; font-size: 17px;";
            b.onclick   = () => { addServer(); };

            let c       = document.createElement("button");
            c.className = "button3";
            c.innerHTML = "Create";
            c.style     = "float: right; height: 40px; width: 100px; font-size: 17px;";
            c.onclick   = () => { createServer(); };
            
            let t         = document.createElement("input");
            t.type        = "text";
            t.placeholder = "Enter a server name...";
            t.className   = "creds";
            t.id          = "addserver";
            t.style       = "float: left; width: calc(100% - 250px); font-size: 20px; margin-top: 5px; height: 40px;";

            let w       = document.createElement("p");
            w.innerHTML = "<br><br>";
            w.id        = "servererror";
            w.style     = "color: red; text-align: center;";

            document.getElementById("servers").appendChild(t);
            document.getElementById("servers").appendChild(c);
            document.getElementById("servers").appendChild(b);
            document.getElementById("servers").appendChild(w);

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

    let serverInput = document.getElementById("addserver").value;

    if (!sanitized(serverInput)) {
        document.getElementById("servererror").innerHTML = "<br><br>Not a valid server name";
        return;
    }
    
    // Tell the server to add a chat server and get the response
    const res = await fetch(`/aserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${encodeURIComponent(serverInput)}`);
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
        document.getElementById("servererror").innerHTML = "<br><br>Server is not joinable";
        return;
    }

}

async function createServer() {

    let serverInput = document.getElementById("addserver").value;

    if (!sanitized(serverInput)) {
        document.getElementById("servererror").innerHTML = "<br><br>Not a valid server name";
        return;
    }
    
    // Tell the server to add a chat server and get the response
    const res = await fetch(`/cserver?u=${sessionStorage.username}&p=${sessionStorage.password}&s=${encodeURIComponent(serverInput)}`);
    if (!res.ok) {
        throw new Error(`HTTP response error: ${res.status}`);
    }
    userData = await res.text().then((text) => {
        return text;
    });

    // Redirect/Display data
    if (userData != "0") {
        addServer();
    } else {
        document.getElementById("servererror").innerHTML = "<br><br>Server name is already taken";
        return;
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
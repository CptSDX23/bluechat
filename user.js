run();

async function run() {
    
    let userData = "";
    let name     = window.location.href.split("/");
    name         = name[name.length - 1];
    name         = name.trim();

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

        let btn = "";
        if (localStorage.getItem("username") == JSON.parse(userData).username) {
            btn = '<button class="button3" onclick="logout()" style="float: right;">Log Out</button>';
            let b       = document.createElement("button");
            b.className = "button3";
            b.innerHTML = "Add Server";
            document.getElementById("servers").appendChild(b);
        }

        document.getElementById("name").innerHTML = JSON.parse(userData).username + btn;
        document.getElementById("desc").innerHTML = JSON.parse(userData).description;

        for (var i = 0; i < JSON.parse(userData).servers.length; i++) {
            let s       = document.createElement("p");
            s.innerHTML = `<a class="clearline" href="/server/${JSON.parse(userData).servers[i]}">${JSON.parse(userData).servers[i]}</a>`
            document.getElementById("servers").appendChild(s);
        }

        document.getElementById("servers").removeChild(document.getElementById("servers").firstElementChild);

        if (localStorage.getItem("username") == JSON.parse(userData).username) {
            
        }

    } else {
        window.location.replace("/404");
    }

}

function logout() {

    localStorage.removeItem("username");
    localStorage.removeItem("password");
    window.location.replace("/");

}

function sanitized(text) {

    const regex = /([A-Z]|[a-z]|[0-9]|_)*/gi;

    return text.replaceAll(regex, "") == "" && text != "";

}
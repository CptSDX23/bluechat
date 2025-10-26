const http = require("http");
const fs   = require("fs");
const url  = require("url");

console.log("Starting BlueChat server...");

const indexFile = fs.readFileSync("index.html");
const cssFile   = fs.readFileSync("style.css");
const pnfFile   = fs.readFileSync("pageNotFound.html");

let app = http.createServer((req, res) => {
    
    console.log(`Incoming request for ${req.url}`);

    if (req.url != undefined) {

        let path = url.parse(req.url).pathname;

        // Resources
        if (path == "/") {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(indexFile);
        } else if (path.endsWith("/style.css")) {
            res.writeHead(200, {"Content-Type": "text/css"});
            res.end(cssFile);
        } else if (path.endsWith("/login.js")) {
            let js = fs.readFileSync("login.js");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(js);
        } else if (path.endsWith("/credentials.js")) {
            let js = fs.readFileSync("credentials.js");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(js);
        } else if (path.endsWith("/user.js")) {
            let js = fs.readFileSync("user.js");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(js);
        } else if (path.endsWith("/chatServer.js")) {
            let js = fs.readFileSync("chatServer.js");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(js);

        } else if (path == "/notallowed") {
            let page = fs.readFileSync("notAllowed.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(page);

        // Pages
        } else if (path == "/login") {

            let page = fs.readFileSync("login.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(page);

        } else if (path == "/signup") {

            let page = fs.readFileSync("signup.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(page);
        
        // Dynamic pages
        } else if (path.startsWith("/server")) {

            let page = fs.readFileSync("server.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(page);

        } else if (path.startsWith("/user")) {

            let page = fs.readFileSync("user.html");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(page);
        
        // Requests
        } else if (path == "/logindata") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let fail  = true;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u && data.accounts[i].password == query.p) {
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end(`/user/${query.u}`);
                    fail = false;
                }
            }

            console.log(`Login: ${query.u}, ${query.p}`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            }
            
        } else if (path == "/signupdata") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let fail  = false;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u) {
                    fail = true;
                }
            }

            console.log(`Signup: ${query.u}, ${query.p}`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.accounts.push(JSON.parse(`{"username": "${query.u}", "password": "${query.p}", "description": "New User", "servers": []}`));
                fs.writeFileSync("loginData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(`/user/${query.u}`);

            }

        } else if (path == "/udata") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let ret   = "";
            let fail  = true;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u) {

                    let serversList = "[";
                    for (var j = 0; j < data.accounts[i].servers.length; j++) {
                        if (j == data.accounts[i].servers.length - 1) {
                            serversList += '"' + data.accounts[i].servers[j] + '"';
                        } else {
                            serversList += '"' + data.accounts[i].servers[j] + '",';
                        }
                    }
                    serversList += "]";

                    ret  = `{ "username": "${query.u}", "description": "${data.accounts[i].description}", "servers": ${serversList} }`;
                    fail = false;

                }
            }

            console.log(`Userdata: ${query.u}`);

            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(ret);
            }

        } else if (path == "/sdata") {

            let query   = url.parse(req.url, true).query;
            let data    = JSON.parse(fs.readFileSync("serverData.json"));
            let accData = JSON.parse(fs.readFileSync("loginData.json"));
            let ret     = "";
            let fail    = true;
            let failAcc = true;

            for (var i = 0; i < data.servers.length; i++) {
                if (data.servers[i].name == query.s) {
                    ret  = JSON.stringify(data.servers[i]);
                    fail = false;
                }
            }
            for (var i = 0; i < accData.accounts.length; i++) {
                if (accData.accounts[i].username == query.u && accData.accounts[i].password == query.p) {
                    failAcc = false;
                }
            }
            if (!fail && !failAcc && JSON.parse(ret).owner != query.u) {
                if (!JSON.parse(ret).whitelist.includes(query.u) && JSON.parse(ret).method == "whitelist") {
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end("1");
                    return;
                }
                if (JSON.parse(ret).blacklist.includes(query.u) && JSON.parse(ret).method == "blacklist") {
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end("1");
                    return;
                }
            }

            console.log(`Serverdata: ${query.u}`);

            if (fail || failAcc) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(ret);
            }

        } else if (path == "/msg") {

            let query   = url.parse(req.url, true).query;
            let data    = JSON.parse(fs.readFileSync("serverData.json"));
            let accData = JSON.parse(fs.readFileSync("loginData.json"));
            let ret     = 0;
            let fail    = true;
            let failAcc = true;

            for (var i = 0; i < data.servers.length; i++) {
                if (data.servers[i].name == query.s) {
                    fail = false;
                    ret  = i;
                }
            }
            for (var i = 0; i < accData.accounts.length; i++) {
                if (accData.accounts[i].username == query.u && accData.accounts[i].password == query.p) {
                    failAcc = false;
                }
            }

            console.log(`Message: ${query.u} "${query.m}"`);

            if (fail || failAcc) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.servers[ret].messages.push(JSON.parse(`{"username": "${query.u}", "message": "${jsonEscape(query.m)}"}`));
                fs.writeFileSync("serverData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("1");

            }

        } else if (path == "/udesc") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let fail  = true;
            let ret   = 0;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u && data.accounts[i].password == query.p) {
                    fail = false;
                    ret  = i;
                }
            }

            console.log(`User Desc: ${query.u}, "${query.d}"`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.accounts[ret].description = jsonEscape(query.d);
                fs.writeFileSync("loginData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("1");

            }

        } else if (path == "/aserver") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let fail  = true;
            let ret   = 0;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u && data.accounts[i].password == query.p) {
                    fail = false;
                    ret  = i;
                }
            }

            console.log(`Add Server: ${query.u}, "${query.s}"`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.accounts[ret].servers.push(query.s);
                fs.writeFileSync("loginData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("1");

            }

        } else if (path == "/lserver") {

            let query = url.parse(req.url, true).query;
            let data  = JSON.parse(fs.readFileSync("loginData.json"));
            let fail  = true;
            let ret   = 0;

            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username == query.u && data.accounts[i].password == query.p) {
                    fail = false;
                    ret  = i;
                }
            }

            console.log(`Leave Server: ${query.u}, "${query.s}"`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                let index = data.accounts[ret].servers.indexOf(query.s);
                if (index > -1) {
                    data.accounts[ret].servers.splice(index, 1);
                }

                fs.writeFileSync("loginData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("1");

            }

        } else if (path == "/eserver") {

            let query   = url.parse(req.url, true).query;
            let accData = JSON.parse(fs.readFileSync("loginData.json"));
            let data    = JSON.parse(fs.readFileSync("serverData.json"));
            let fail    = true;
            let failAcc = true;
            let ret     = 0;

            for (var i = 0; i < data.servers.length; i++) {
                if (data.servers[i].name == query.s && data.servers[i].owner == query.u) {
                    fail = false;
                    ret  = i;
                }
            }

            for (var i = 0; i < accData.accounts.length; i++) {
                if (accData.accounts[i].username == query.u && accData.accounts[i].password == query.p) {
                    failAcc = false;
                }
            }

            console.log(`Edit Server: ${query.u}, "${query.d}", ${query.m}`);
            
            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.servers[ret].description = query.d;
                data.servers[ret].method      = query.m;

                if (query.m == "whitelist") {
                    data.servers[ret].whitelist = query.l.split(",");
                } else {
                    data.servers[ret].blacklist = query.l.split(",");
                }

                fs.writeFileSync("serverData.json", JSON.stringify(data, null, 4), "utf8");

                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("1");

            }
            
        // 404
        } else {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end(pnfFile);
        }

    } else {
        let favicon = fs.readFileSync("b.webp");
        res.writeHead(200, {"Content-Type": "image/webp"});
        res.end(favicon);
    }

});

const hostname = "localhost";
const port     = 8000;

//app.listen(port, hostname, () => {
        //console.log(`BlueChat server running at http://${hostname}:${port}`)
//});

 app.listen(3000, "0.0.0.0");
console.log("Running BlueChat server from 3000");

function jsonEscape(str)  {
    return str.replace(/"/g, "\\\"")
}
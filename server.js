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

            let query   = url.parse(req.url, true).query;
            let rawData = fs.readFileSync("loginData.json");
            let data    = JSON.parse(rawData);
            let fail    = true;

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

            let query   = url.parse(req.url, true).query;
            let rawData = fs.readFileSync("loginData.json");
            let data    = JSON.parse(rawData);
            let fail    = false;

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

            let query   = url.parse(req.url, true).query;
            let rawData = fs.readFileSync("loginData.json");
            let data    = JSON.parse(rawData);
            let ret     = "";
            let fail    = true;

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
            let rawData = fs.readFileSync("serverData.json");
            let data    = JSON.parse(rawData);
            let ret     = "";
            let fail    = true;

            for (var i = 0; i < data.servers.length; i++) {
                if (data.servers[i].name == query.u) {

                    ret  = JSON.stringify(data.servers[i]);
                    fail = false;

                }
            }

            console.log(`Serverdata: ${query.u}`);

            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(ret);
            }

        } else if (path == "/msg") {

            let query   = url.parse(req.url, true).query;
            let rawData = fs.readFileSync("serverData.json");
            let data    = JSON.parse(rawData);
            let ret     = 0;
            let fail    = true;

            for (var i = 0; i < data.servers.length; i++) {
                if (data.servers[i].name == query.s) {

                    fail = false;
                    ret  = i;

                }
            }

            console.log(`Message: ${query.u} "${query.m}"`);

            if (fail) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end("0");
            } else {

                data.servers[ret].messages.push(JSON.parse(`{"username": "${query.u}", "message": "${query.m}"}`));
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

app.listen(port, hostname, () => {
        console.log(`BlueChat server running at http://${hostname}:${port}`)
});

// app.listen(8000, "0.0.0.0");
// console.log("Running BlueChat server from 8000");
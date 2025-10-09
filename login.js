async function login() {

    let loginData = "";
    let username  = document.getElementById("username").value;
    let password  = document.getElementById("password").value;

    if (!sanitized(username) || !sanitized(password)) {
        document.getElementById("error").innerHTML = "Usernames and passwords may only contain letters, numbers, and underscores";
        return;
    }

    // Tell the server to log in and get the response
    const res = await fetch(`/logindata?u=${username}&p=${password}`);
    if (!res.ok) {
      throw new Error(`HTTP response error: ${res.status}`);
    }
    loginData = await res.text().then((text) => {
        return text;
    });

    // Redirect
    if (loginData != "0") {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        window.location.replace(loginData);
    } else {
        document.getElementById("error").innerHTML = "Username or password incorrect";
    }

}

async function signup() {

    let signupData = "";
    let username   = document.getElementById("username").value;
    let password   = document.getElementById("password").value;

    if (!sanitized(username) || !sanitized(password)) {
        document.getElementById("error").innerHTML = "Usernames and passwords may only contain letters, numbers, and underscores";
        return;
    }

    // Tell the server to log in and get the response
    const res = await fetch(`/signupdata?u=${username}&p=${password}`);
    if (!res.ok) {
      throw new Error(`HTTP response error: ${res.status}`);
    }
    signupData = await res.text().then((text) => {
        return text;
    });

    // Redirect
    if (signupData != "0") {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        window.location.replace(signupData);
    } else {
        document.getElementById("error").innerHTML = "Username is already in use";
    }

}

function sanitized(text) {

    const regex = /([A-Z]|[a-z]|[0-9]|_)*/gi;

    return text.replaceAll(regex, "") == "" && text != "";

}
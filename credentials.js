const username = sessionStorage.username;

if (username) {
    document.getElementById("acc").innerHTML = username;
    document.getElementById("acc").href      = `/user/${username}`;
}
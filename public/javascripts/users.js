import { displayError } from "./error.js";

async function deleteUserHandler(userId) {
    if(!confirm("Are you sure you want to delete this user?")) {
        return;
    }
    let res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
    })
    if(res.status !== 200) {
        displayError("Error deleting user.");
        return;
    } else {
        window.location.reload();
    }
}
window.deleteUserHandler = deleteUserHandler;



document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("createUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        await createUserHandler();
        return; 
    });
});


async function createUserHandler() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let role = document.getElementById("role").value.trim();

    if(username === "" || password === "" || role === "") {
        displayError("Please fill all fields.");
        return;
    }

    let res = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
    });
    if(res.status !== 200) {
        displayError("Error creating user status:"+res.status);
        return;
    } else {
        window.location="/users";
        return;
    }
}
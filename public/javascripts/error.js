function toggleError() {
    let errorCont = document.getElementById("error-container")
    if(errorCont.style.display === "none") {
        errorCont.style.display = "flex"
    } else {
        errorCont.style.display = "none"
    }
}

export function displayError(message) {
    const url = new URL(window.location.href);
    url.searchParams.set("error", message);
    window.location.href = url.toString();
}   

window.toggleError = toggleError;
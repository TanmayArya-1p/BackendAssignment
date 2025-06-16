function toggleUserRoles(status) {
    const url = new URL(window.location.href);
    let currFilters = []
    if(url.searchParams.get("roleFilters")) {
      currFilters = url.searchParams.get("roleFilters").split(",");
    }
    if (currFilters.includes(status)) {
      currFilters = currFilters.filter(item => item !== status);
      url.searchParams.delete("roleFilters");
    } else {
      currFilters.push(status);
    }
    url.searchParams.set("roleFilters", currFilters.join(","));
    window.location.href = url.toString();
}

window.toggleUserRoles = toggleUserRoles;


function searchUserHandler() {
    let par = document.getElementById("search-input").value.trim();
    par = par.toLowerCase();
    const url = new URL(window.location.href);
    if (par === "") {
        url.searchParams.delete("search");
    } else {
        url.searchParams.set("search", par);
    }
    window.location.href = url.toString();
}

window.searchUserHandler = searchUserHandler;
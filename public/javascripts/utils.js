import { displayError } from "./error.js";

function logoutHandler() {
  fetch("/api/auth/logout", {
    method: "POST",
  }).then((res) => {
    if (res.status === 200) {
      window.location.href = "/";
    } else {
      displayError("Error logging out. Please try again.");
    }
  });
}
async function navigateToOrder() {
  const orderId = document.getElementById("navigate-order-id").value.trim();
  if (orderId === "") {
    displayError("Invalid Order ID");
    return;
  }
  let res = await fetch(`/order/${orderId}`);
  if (res.status !== 200) {
    displayError("Invalid Order ID");
    return;
  }
  window.location.href = `/order/${orderId}`;
}
window.navigateToOrder = navigateToOrder;

window.logoutHandler = logoutHandler;


function toggleOrderFilter(status) {
    const url = new URL(window.location.href);
    let currFilters = []
    if(url.searchParams.get("orderFilters")) {
      currFilters = url.searchParams.get("orderFilters").split(",");
    }
    if (currFilters.includes(status)) {
      currFilters = currFilters.filter(item => item !== status);
      url.searchParams.delete("orderFilters");
    } else {
      currFilters.push(status);
    }
    url.searchParams.set("orderFilters", currFilters.join(","));
    window.location.href = url.toString();
}
window.toggleOrderFilter = toggleOrderFilter;

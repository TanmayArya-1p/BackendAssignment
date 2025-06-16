import { displayError } from "./error.js";

function deleteOrderHandler(orderid) {
  if (!confirm("Are you sure you want to delete this order?")) {
    return;
  }
  fetch(`/api/orders/${orderid}`, {
    method: "DELETE",
  })
    .then((_) => (window.location.href = "/home"))
    .catch((err) => {
      displayError("Error deleting order");
    });
}
window.deleteOrderHandler = deleteOrderHandler;

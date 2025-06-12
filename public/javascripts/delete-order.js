function deleteOrderHandler(orderid) {
  if (!confirm("Are you sure you want to delete this order?")) {
    return;
  }
  fetch(`/api/orders/${orderid}`, {
    method: "DELETE",
  })
    .then((_) => (window.location.href = "/home"))
    .catch((err) => {
      alert("Error deleting order");
    });
}
window.deleteOrderHandler = deleteOrderHandler;

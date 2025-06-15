import ItemFilter from "./item-filter.js";

let itemf = new ItemFilter(
  document.getElementById("item-selector"),
  document.getElementById("item-template"),
);
window.itemf = itemf;

async function createOrderHandler() {
  let table_no = Number(document.getElementById("table_no").value.trim());
  if (isNaN(table_no) || table_no <= 0) {
    alert("Please enter a proper table number");
    return;
  }

  let res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      table_no: table_no,
    }),
  });
  if(res.status !== 200) {
    alert("Failed to create order")
    return;
  }
  res = await res.json();
  let orderID = res.id;
  await itemf.addItemsToOrder(orderID);
  window.location.href = `/order/${orderID}`;
}
window.createOrderHandler = createOrderHandler;

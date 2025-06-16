import ItemFilter from "./item-filter.js";
import { displayError } from "./error.js";

let itemf = new ItemFilter(
  document.getElementById("item-selector"),
  document.getElementById("item-template"),
);
window.itemf = itemf;

async function createOrderHandler() {
  let table_no = Number(document.getElementById("table_no").value.trim());
  if (isNaN(table_no) || table_no <= 0 || table_no > 100) {
    
    displayError("Please enter a proper table number (Table No must be between 1 and 100 [Inclusive])");
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
    displayError("Failed to create order")
    return;
  }
  res = await res.json();
  let orderID = res.id;
  let addRes = await itemf.addItemsToOrder(orderID);
  if(addRes !== -1) window.location.href = `/order/${orderID}`
}
window.createOrderHandler = createOrderHandler;

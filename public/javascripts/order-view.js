import { displayError } from "./error.js";
import ItemFilter from "./item-filter.js";

let ctrMap = {};
let price = 0;
let priceIndex = {};

let itemf = new ItemFilter(
  document.getElementById("item-selector"),
  document.getElementById("item-template"),
);
window.itemf = itemf;

async function initPriceIndex() {
  let res = await fetch("/api/items");
  res = await res.json();
  res.forEach((item) => {
    priceIndex[item.id] = item.price;
  });
}

async function billHandler(orderid) {
  if(!confirm("Are you sure you want to resolve the bill? Once resolved, you cannot add more items to this order.")) {
    return;
  }
  await fetch(`/api/orders/${orderid}/bill?resolve=true`, {
      method: 'GET'
  })
  window.location.reload()
}
window.billHandler = billHandler;

async function payHandler(orderid) {
  let amt = document.getElementById("paid-amount").value.trim();
  amt = Number(amt);
  if(isNaN(amt) || amt <= 0) {
    displayError("Invalid amount entered");
    return;
  }
  let res = await fetch(`/api/orders/${orderid}/bill/pay`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          amount: amt
      })
  })
  if(res.status !== 200) {
    displayError("Invalid Amount. Please try again.");
    return;
  }
  window.location.reload()
}
window.payHandler = payHandler;


initPriceIndex();

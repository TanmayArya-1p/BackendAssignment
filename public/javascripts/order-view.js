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

initPriceIndex();

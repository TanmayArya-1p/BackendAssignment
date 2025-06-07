import db from "./db.js";
import Order from "./order.js";


let bumpMap = {
    "pending" : "preparing",
    "preparing" : "served",
}

export async function getAllOrderedItems() {
    let items = await db.query("SELECT * FROM order_items ORDER BY issued_at DESC");
    return items[0];
}

export async function getOrderedItemById(id) {
    let item = await db.query("SELECT * FROM order_items WHERE id = ?", [id]);
    if (!item[0][0]) throw new Error(`Not found`);
    return item[0][0];
}

export async function bumpStatus(id) {
    let item = await getOrderedItemById(id);
    if (!bumpMap[item.status]) throw new Error("Cannot bump");
    await db.query("UPDATE order_items SET status = ? WHERE id = ?", [bumpMap[item.status], id]);
    await evaluateOrderStatus(item.order_id);
    return (await getOrderedItemById(id));
}

export async function evaluateOrderStatus(id) {
    let order = await Order.getOrderById(id)
    let minStatus = order.ordered_items.reduce((acc,curr) => acc<curr.status?acc: curr.status, "pending");
    if(order.status !==minStatus) {
        await Order.updateOrder(id,minStatus)
    }
}


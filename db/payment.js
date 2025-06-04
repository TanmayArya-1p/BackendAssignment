import db from "./db.js";

export async function getAllPayments() {
  const payments = await db.query("SELECT * FROM payments");
  return payments[0];
}

export async function getPaymentById(id) {
  const payment = await db.query("SELECT * FROM payments WHERE id = ?", [id]);
  if (!payment[0][0]) throw new Error(`Payment id ${id} not found`);
  return payment[0][0];
}

export async function getPaymentsForOrder(orderId) {
  const payments = await db.query("SELECT * FROM payments WHERE order_id = ?", [
    orderId,
  ]);
  return payments[0];
}

export async function getAmountPayedForOrder(orderId) {
  let payments = await getPaymentsForOrder(orderId);
  return payments.reduce((prev, curr) => prev + curr, 0);
}

export async function createPayment(order_id, amount, payer, tip) {
  let inserted_id = await db.query(
    "INSERT INTO payments (order_id,amount, payer, tip) VALUES (?, ?, ?, ?)",
    [order_id, amount, payer, tip],
  );
  inserted_id = inserted_id[0].insertId;
  let result = await getPaymentById(inserted_id);
  return result;
}

export async function updatePayment(id, order_id, amount, payer, tip) {
  await db.query(
    "UPDATE payments SET order_id = ?, amount = ?, payer = ?, tip = ? WHERE id = ?",
    [order_id, amount, payer, tip, id],
  );
  let result = await getPaymentById(id);
  return result;
}

export async function deletePayment(id) {
  let org = await getPaymentById(id);
  await db.query("DELETE FROM payments WHERE id = ?", [id]);
  return org;
}

import express from "express";
import db from "./db/index.js";

// const app = express();
// const PORT = 3000;

/*
PATHS TO MAKE:

/login -> USER SENDS OVER USERNAME,PASSWORD FOR ACCESS TOKEN
/refresh -> USER SENDS OVER REFRESH TOKEN AND ACCESS TOKEN FOR NEW ACCESS TOKEN
/register -> USER SENDS OVER USERNAME,PASSWORD TO REGISTER

MIDDLEWARE THAT AUTO REFRESHES TOKEN IF EXPIRED

GET /orders -> list of all orders
POST /orders -> create a new order
GET /orders/:id -> get a single order by id
DELETE /orders/:id -> delete a single order by id (admin privs)

GET /items -> list of all items
POST /items -> create a new item (admin privs)
GET /items/:id -> get a single item by id
DELETE /items/:id -> delete a single item by id (admin privs)

*/

async function userSubmoduleTest() {
  let u1 = new db.User({ username: "u1", password: "u1" });
  let u2 = new db.User({ username: "u2", password: "u2" });
  await u1.create();
  await u2.create();
  console.log(await db.User.getAllUsers());
  u1.delete();
  u2.delete();
  console.log(await db.User.getAllUsers());
  u1.create();

  console.log(await u1.verifyPassword("u1"));
  console.log(await u1.verifyPassword("u2"));
  console.log(await db.User.getUserByUsername("u1"));

  console.log(await u1.updateUser("u11", "u11"));

  console.log(await db.User.getAllUsers());
  await u1.delete();
  await u2.delete();
  console.log(await db.User.getAllUsers());
}
async function itemSubmoduleTest() {
  let i1 = new db.Item({
    name: "i1",
    description: "i1",
    price: 1,
    tags: ["tag1", "tag2"],
  });
  let i2 = new db.Item({
    name: "i2",
    price: 2,
    description: "i2",
    tags: ["tag2", "tag3"],
  });
  await db.Tags.createTag("tag1");
  await db.Tags.createTag("tag2");
  await db.Tags.createTag("tag3");
  await i1.create();
  await i2.create();
  console.log(await db.Item.getAllItems());
  await i1.delete();
  await i2.delete();
  console.log(await db.Item.getAllItems());
  await i1.create();

  console.log(await db.Item.getItemById(3));
  let test = new db.Item(3);
  await test.hydrate();
  console.log(test);

  console.log(
    await i1.updateItem({
      name: "i11",
      desc: "i11",
      updtags: ["tag2", "tag3"],
    }),
  );

  console.log(await db.Item.getAllItems());
}
async function orderSubmoduleTest() {
  let u1 = new db.User({ username: "u1", password: "u1" });
  await u1.create();
  let i1 = new db.Item({
    name: "i1",
    description: "i1",
    price: 1,
  });
  await i1.create();
  let i2 = new db.Item({
    name: "i2",
    description: "i2",
    price: 2,
  });
  await i2.create();

  let o1 = new db.Order({
    issued_by: 1,
    table_no: 1,
  });
  await o1.create();

  await o1.orderItem(i1.id, 2);
  await o1.orderItem(i2.id, 2);

  console.log(await o1.resolveBillableAmount(true));
  console.log(await db.Order.getAllOrders());

  await o1.payBill(1, 2);
  console.log(await db.Order.getAllOrders());
}

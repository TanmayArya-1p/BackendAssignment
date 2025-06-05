import express from "express";
import db from "./db/index.js";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.js";
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

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// db.conn.destroy();

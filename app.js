import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.js";
import itemsRouter from "./routers/items.js";
import usersRouter from "./routers/users.js";
import swaggerRouter from "./routers/swagger.js";
import ordersRouter from "./routers/orders.js";
import logger from "morgan";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import viewsRouter from "./render.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/" , viewsRouter)
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/swagger", swaggerRouter);

app.use("/",function (req, res, next) {
  res.render("error" , {
    message: "Page Not Found",
    desc: ""
  })
});

export default app;

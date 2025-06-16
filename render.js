import express from "express";
import * as authUtils from "./utils/auth.js";
import * as authMiddleware from "./middleware/auth.js";
import db from "./db/index.js";
import { orderColourMap, paginate } from "./utils/misc.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

let viewsRouter = express.Router();

viewsRouter.get("/", function (req, res) {
  res.render("index");
});
viewsRouter.get("/login", function (req, res) {
  res.render("login" , 
    {
      error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
    }
  );
});
viewsRouter.get("/register", function (req, res) {
  res.render("register",{
    error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
  });
});

viewsRouter.get(
  "/home",
  authMiddleware.authenticationMiddleware(false, true),
  async function (req, res) {
    let selectedTags = req.query.tags ? req.query.tags.split(",") : [];
    let selectHM = {};
    for (const i of selectedTags) {
      selectHM[i] = true;
    }

    let orders = null;
    if (res.locals.user.role === "customer") {
      orders = await db.Order.getAllOrdersByUser(res.locals.user);
    } else {
      orders = await db.Order.getAllOrders(-1);
    }

    let items = null;
    let page = null;

    let orderFilters = req.query.orderFilters ? req.query.orderFilters.split(",") : ["pending", "preparing", "served", "billed"];

    switch (res.locals.user.role) {
      case "customer":
        orders = orders.filter(a=>orderFilters.includes(a.status))

        if (selectedTags.length > 0) {
          items = await db.Item.getItemsofTag(selectedTags, -1, 0);
        } else {
          items = await db.Item.getAllItems(-1, 0);
        }
        page = paginate(items, req);
        items = page.filtered;
        res.render(`customer-home`, {
          user: res.locals.user,
          orders: orders,
          items: items,
          orderColourMap: orderColourMap,
          tags: await db.Tags.getAllTags(),
          selectedTags: selectHM,
          page: page,
          error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
          selectedStatusTags: orderFilters,
          statustags:["pending", "preparing", "served", "billed"].map(a=>!orderFilters.includes(a) ? a : null).filter(a=>a!==null),
        });
        break;
      case "chef":
        orders = orders.filter(a=>a.status!=="paid")
        var unorders = orders.filter((a)=>a.status==="billed")
        orders = orders.filter(a=>orderFilters.includes(a.status))

        page = paginate(orders, req);
        orders = page.filtered;

        items = await db.Item.getAllItems(-1, 0);
        let itemHM = {};
        for (const item of items) {
          itemHM[item.id] = item;
        }

        let orderedItems = await db.OrderItems.getAllOrderedItems();
        orderedItems = orderedItems.filter(
          (a) => a.status === "pending" || a.status === "preparing",
        );
        orderedItems.sort((a, b) => {
          if (a.status === b.status) return 0;
          if (a.status === "preparing") return -1;
          if (b.status === "preparing") return 1;
          return 0;
        });

        res.render(`chef-home`, {
          user: res.locals.user,
          orders: orders,
          orderedItems: orderedItems,
          orderColourMap: orderColourMap,
          page: page,
          itemHM: itemHM,
          error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
          selectedStatusTags: orderFilters,
          statustags:["pending", "preparing", "served", "billed"].map(a=>!orderFilters.includes(a) ? a : null).filter(a=>a!==null),
          unorders: unorders,
        });
        break;

      case "admin":
        let paidorders = orders.filter(a=>a.status==="paid")
        orders = orders.filter(a=>a.status!=="paid")
        var unorders = orders.filter((a)=>a.status==="billed")
        orders = orders.filter(a=>orderFilters.includes(a.status))
        page = paginate(orders, req);
        orders = page.filtered;

        let paidPage = paginate(paidorders,req,"paid")
        paidorders = paidPage.filtered

        items = await db.Item.getAllItems(-1, 0);

        res.render(`admin-home`, {
          user: res.locals.user,
          orders: orders,
          orderColourMap: orderColourMap,
          page: page,
          items: items,
          paidorders: paidorders,
          paidPage:paidPage,
          error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
          selectedStatusTags: orderFilters,
          statustags:["pending", "preparing", "served", "billed"].map(a=>!orderFilters.includes(a) ? a : null).filter(a=>a!==null),
          unorders: unorders,
        });
        break;
    }
  },
);
viewsRouter.get(
  "/order/create",
  authMiddleware.authenticationMiddleware(false, true),
  async function (req, res) {
    res.render("create-order", {
      user: res.locals.user,
      items: await db.Item.getAllItems(),
      tags: await db.Tags.getAllTags(),
      error :  DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
    });
  },
);

viewsRouter.get(
  "/order/:orderid",
  authMiddleware.authenticationMiddleware(false, true),
  async function (req, res) {
    let order = await db.Order.getOrderById(Number(req.params.orderid));

    if (!order) {
      return res.status(404).send("Not Found");
    }

    if (
      res.locals.user.role === "customer" &&
      order.issued_by !== res.locals.user.id
    ) {
      return res.status(403).send("Forbidden");
    }

    res.render("order-view", {
      user: res.locals.user,
      items: await db.Item.getAllItems(),
      order: order,
      orderColourMap: orderColourMap,
      tags: await db.Tags.getAllTags(),
      error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
    });
  },
);


viewsRouter.get("/users" , authMiddleware.authenticationMiddleware() , authMiddleware.authorizationMiddleware(authUtils.ADMIN), async (req,res) => {
    let users = await db.User.getAllUsers(-1,0);
    let selectedRoles = req.query.roleFilters ? req.query.roleFilters.split(",") : [];

    let searchParam = req.query.search || "";

    if (selectedRoles.length > 0) {
        users = users.filter(a => selectedRoles.includes(a.role));
    }
    if(searchParam !== "") {
        users = users.filter(a => a.username.toLowerCase().includes(searchParam.toLowerCase()));
    }

    let page = paginate(users, req, "", 8);
    users = page.filtered;
    res.render("users", {
        user: res.locals.user,
        users: users,
        error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
        page: page,
        selectedRoles : selectedRoles,
        roles: ["admin", "chef", "customer"].filter(a=>!selectedRoles.includes(a))
    });
})


viewsRouter.get("/items" , authMiddleware.authenticationMiddleware() , authMiddleware.authorizationMiddleware(authUtils.ADMIN), async (req,res) => {
    let items = await db.Item.getAllItems(-1,0);
    let selectedTags = req.query.tags ? req.query.tags.split(",") : [];

    let searchParam = req.query.search || "";
    if (selectedTags.length > 0) {
        items = items.filter(a=> a.tags.some(b => selectedTags.includes(b[1])));
    }
    if(searchParam !== "") {
        items = items.filter(a => a.name.toLowerCase().includes(searchParam.toLowerCase()));
    }

    let page = paginate(items, req, "", 8);
    items = page.filtered;
    res.render("items", {
        user: res.locals.user,
        items: items,
        error: DOMPurify(new JSDOM('<!DOCTYPE html>').window).sanitize(req.query.error || ""),
        page: page,
        selectedTags : selectedTags,
        tags: (await db.Tags.getAllTags()).filter(a=>!selectedTags.includes(a.name)),
    });
})



export default viewsRouter;
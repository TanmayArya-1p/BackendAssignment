import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";

let router = express.Router();

router.use(express.json());
router.use(authMiddleware.authenticationMiddleware());
router.use(authMiddleware.authorizationMiddleware(authUtils.ADMIN));

router.get("/", async (req, res) => {
  let limit = Number(req.query.limit);
  let offset = Number(req.query.offset);

  if (isNaN(limit)) limit = -1;
  if (isNaN(offset)) offset = 0;

  res.send(await db.User.getAllUsers(limit, offset));
});

router.get("/:userid", async (req, res) => {
  try {
    res.send(await db.User.getUserById(req.params.userid));
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

// TODO: fix ui CUSTOMER HOME AND CHEF HOME

router.post("/", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let role = req.body.role;
  if (!username || !password || !role) {
    response
      .status(400)
      .send(new Error("Username, password and role are required"));
    return;
  }

  let user = new db.User({
    username: username,
    password: password,
    role: role,
  });
  try {
    await user.create();
    res.status(200).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error : " + error });
  }
});

router.delete("/:userid", async (req, res) => {
  try {
    let us = await db.User.getUserById(req.params.userid);
    await us.delete();
    res.status(200).send({ message: "Successfuly deleted user", user: us });
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

router.put("/:userid", async (req, res) => {
  try {
    let us = await db.User.getUserById(req.params.userid);
    if (!req.body.username) req.body.username = us.username;
    if (!req.body.role) req.body.role = us.role;

    let updobj = {
      username: req.body.username,
      role: req.body.role,
    };
    if (req.body.password) updobj.password = req.body.password;
    await us.updateUser(updobj);

    res.status(200).send({ message: "Successfuly updated user", user: us });
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

export default router;

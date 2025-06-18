import express from "express";
import db from "../db/index.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";

let router = express.Router();

router.use(express.json());
router.use(authMiddleware.authenticationMiddleware());
router.use(authMiddleware.authorizationMiddleware(authUtils.ADMIN));

/**
 * @openapi
 * /api/users:
 *  get:
 *   summary: Get all users
 *   description: Must be ADMIN
 *   tags:
 *     - Users
 *   security:
 *     - AuthHeader: []
 *   parameters:
 *      - name: limit
 *        description: Max no of orders to retrieve
 *        in: query
 *        required: false
 *      - name: offset
 *        description: Offset from the start to fetch orders
 *        in: query
 *        required: false
 *   responses:
 *      200:
 *        description: Success
 *
 */
router.get("/", async (req, res) => {
  let limit = Number(req.query.limit);
  let offset = Number(req.query.offset);

  if (isNaN(limit)) limit = -1;
  if (isNaN(offset)) offset = 0;

  res.send(await db.User.getAllUsers(limit, offset));
});

/**
 * @openapi
 * /api/users/{userid}:
 *  get:
 *   summary: Get specific user by id
 *   description: Must be ADMIN
 *   tags:
 *     - Users
 *   security:
 *     - AuthHeader: []
 *   parameters:
 *      - name: userid
 *        description: ID of user
 *        in: path
 *        required: true
 *        type: number
 *   responses:
 *      200:
 *        description: Success
 *
 */
router.get("/:userid", async (req, res) => {
  try {
    res.send(await db.User.getUserById(req.params.userid));
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

/**
 * @openapi
 * /api/users:
 *  post:
 *   summary: Create user
 *   description: Must be ADMIN
 *   tags:
 *     - Users
 *   security:
 *     - AuthHeader: []
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: true
 *              password:
 *                type: string
 *                required: true
 *              role:
 *                type: string
 *                required: true
 *                enum: ["customer","admin","chef"]
 *   responses:
 *      200:
 *        description: Success
 *
 */
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

/**
 * @openapi
 * /api/users/{userid}:
 *  delete:
 *   summary: Delete specific user by id
 *   description: Must be ADMIN
 *   tags:
 *     - Users
 *   security:
 *     - AuthHeader: []
 *   parameters:
 *      - name: userid
 *        description: ID of user
 *        in: path
 *        required: true
 *        type: number
 *   responses:
 *      200:
 *        description: Success
 *
 */
router.delete("/:userid", async (req, res) => {
  try {
    let us = await db.User.getUserById(req.params.userid);
    if(us.username === "admin") {
      return res.status(400).send({ message: "Cannot delete admin user" });
    }
    await us.delete();
    res.status(200).send({ message: "Successfuly deleted user", user: us });
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

/**
 * @openapi
 * /api/users/{userid}:
 *  put:
 *   summary: Update user
 *   description: Must be ADMIN
 *   tags:
 *     - Users
 *   security:
 *     - AuthHeader: []
 *   parameters:
 *      - name: userid
 *        description: ID of user
 *        in: path
 *        required: true
 *        type: number
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                required: true
 *              password:
 *                type: string
 *                required: true
 *              role:
 *                type: string
 *                required: true
 *                enum: ["customer","admin","chef"]
 *   responses:
 *      200:
 *        description: Success
 *
 */
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

    if(us.username === "admin" && ((!updobj.username || updobj.username !== "admin") || (!updobj.role || updobj.role !== "admin"))) {
      return res.status(400).send({ message: "Cannot change default admin username or role" });
    }

    await us.updateUser(updobj);

    res.status(200).send({ message: "Successfuly updated user", user: us });
  } catch (err) {
    res.status(400).send({ message: "Invalid userid" });
  }
});

export default router;


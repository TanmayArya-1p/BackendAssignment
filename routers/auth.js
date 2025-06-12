import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";

let router = express.Router();

router.use(express.json());

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     security:
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/register", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    response.status(400).send(new Error("Username and password are required"));
    return;
  }

  let user = new db.User({
    username: username,
    password: password,
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
 * /api/auth/login:
 *   post:
 *     summary: Register a new user
 *     security:
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 authToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 */
router.post("/login", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password) {
    response.status(400).send(new Error("Username and password are required"));
    return;
  }

  let user = new db.User({
    username: username,
    password: password,
  });
  try {
    let stat = await user.verifyPassword(password);
    if (stat) {
      let authToken = await jwt.createAuthToken(user);
      let refreshToken = await jwt.createRefreshToken(user);
      res.cookie("authToken", authToken, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
        path: "/api/auth",
        sameSite: "strict",
      });
      res.send({
        message: "Logged In Successfully",
        authToken: authToken,
        refreshToken: refreshToken,
      });
    } else {
      res.status(401).send({ message: "Invalid username or password." });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error : " + error });
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Invalidate user refresh token and logout
 *     security:
 *        - AuthHeader: []
 *        - RefreshHeader: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/logout",
  authMiddleware.authenticationMiddleware(true),
  async (req, res) => {
    let refreshToken = authUtils.extractRefreshToken(req);
    if (!refreshToken) return authUtils.UnauthorizedResponse(res);
    await jwt.verifyRefreshToken(refreshToken, res.locals.user, true);
    await db.Jti.cleanupJti();
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    res.send({ message: "Logged Out Successfully" });
  },
);

/**
 * @openapi
 * /api/auth/refresh:
 *   get:
 *     summary: Refresh auth token.
 *     description: The new auth and refresh tokens are returned in the Set-Cookie response header.
 *     security:
 *        - AuthHeader: []
 *        - RefreshHeader: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/refresh",
  authMiddleware.authenticationMiddleware(true),
  async (req, res) => {
    res.send({
      message: "Refreshed",
    });
  },
);

/**
 * @openapi
 * /api/auth/verify:
 *   get:
 *     summary: Validate user's session and if expired then re-issue auth and refresh token
 *     security:
 *        - AuthHeader: []
 *        - RefreshHeader: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/verify",
  authMiddleware.authenticationMiddleware(true),
  async (req, res) => {
    res.send({
      message: "Verified",
    });
  },
);

export default router;

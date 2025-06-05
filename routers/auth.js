import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";

let router = express.Router();

router.use(express.json());

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

router.post("/login", async (req, res) => {
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
    let stat = await user.verifyPassword(password);
    if (stat) {
      let authToken = await jwt.createAuthToken(user);
      let refreshToken = await jwt.createRefreshToken(user);
      res.cookie("authToken", authToken, {
        maxAge: process.env.AUTH_TOKEN_EXPIRES * 1000,
        httpOnly: true,
        sameSite: "strict",
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: process.env.REFRESH_TOKEN_EXPIRES * 1000,
        httpOnly: true,
        sameSite: "strict",
      });
      res.send({ message: "Logged In Successfully" });
    } else {
      res.status(401).send({ message: "Invalid username or password." });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error : " + error });
  }
});

//TODO: VERIFY USER USING MIDDLEWARE FIRST FOR logout
// TODO: CHANGE LET =NULL TO VAR EVEYRWHERE
router.post("/logout", (req, res) => {
  if (req.headers.authorization) {
    var authToken = req.headers.authorization.slice("Bearer ".length);
  } else if (req.cookies.authToken) {
    var authToken = req.cookies.authToken;
  } else {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
});

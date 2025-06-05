import express from "express";
import db from "../db/index.js";

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
      //NEED FUNCTION TO GENERATE A AUTH JWT
      //NEED FUNCTION TO GENERATE A REFRESH TOKEN
      // REUTNR THESE TOKENS
    } else {
      res.status(401).send({ message: "Invalid username or password." });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error : " + error });
  }
});

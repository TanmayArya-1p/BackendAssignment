import express from "express";
import * as jwt from "../utils/jwt.js";
import db from "../db/index.js";
import * as authUtils from "../utils/auth.js";

export async function authenticationMiddleware(req, res, next) {
  let authToken = authUtils.extractAuthToken(req);
  if (!authToken) authUtils.UnauthorizedResponse(res);
  let auth = await jwt.verifyJWT(authToken);

  if (auth.status === "invalid") authUtils.UnauthorizedResponse(res);

  try {
    var user = new db.User(auth.data.userID);
    await user.hydrateData();
  } catch (err) {
    authUtils.UnauthorizedResponse(res);
  }

  if (auth !== "valid") {
    let refreshToken = res.locals.refreshToken;

    if (!refreshToken) authUtils.UnauthorizedResponse(res);
    let stat = jwt.verifyRefreshToken(token, user);
    if (!stat) authUtils.UnauthorizedResponse(res);

    let newRefreshToken = jwt.createRefreshToken(user);
    let newAuthToken = jwt.createAuthToken(user);

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
    res.cookie("authToken", newAuthToken, { httpOnly: true });
  }
  res.locals.user = user;
  next();
}

export async function authorizationMiddleware(req, res, next) {
  let user = res.locals.user;
  next();
}

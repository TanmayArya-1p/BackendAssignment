import express from "express";
import * as jwt from "../utils/jwt.js";
import db from "../db/index.js";
import * as authUtils from "../utils/auth.js";

export async function authenticationMiddleware(req, res, next) {
  let authToken = authUtils.extractAuthToken(req);
  if (!authToken) return authUtils.UnauthorizedResponse(res);
  let auth = await jwt.verifyJWT(authToken);
  if (auth.status === "invalid") return authUtils.UnauthorizedResponse(res);
  try {
    var user = new db.User(auth.data.userID);
    await user.hydrateData();
  } catch (err) {
    return authUtils.UnauthorizedResponse(res);
  }
  if (auth.status !== "valid") {
    let refreshToken = authUtils.extractRefreshToken(req);
    if (!refreshToken) return authUtils.UnauthorizedResponse(res);
    let stat = jwt.verifyRefreshToken(refreshToken, user);
    if (!stat) return authUtils.UnauthorizedResponse(res);

    let newRefreshToken = await jwt.createRefreshToken(user);
    let newAuthToken = await jwt.createAuthToken(user);

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
    res.cookie("authToken", newAuthToken, { httpOnly: true });
  }
  res.locals.user = user;
  next();
}

export function authorizationMiddleware(allowedRole = authUtils.CUSTOMER) {
  return (req, res, next) => {
    let user = res.locals.user;
    if (authUtils.roleMap[user.role] >= allowedRole) next();
    else return authUtils.UnauthorizedResponse(res);
  };
}

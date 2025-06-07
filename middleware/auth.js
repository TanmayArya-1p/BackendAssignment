import express from "express";
import * as jwt from "../utils/jwt.js";
import db from "../db/index.js";
import * as authUtils from "../utils/auth.js";


export async function isAuthenticated(req,res,next) {
    let authToken = authUtils.extractAuthToken(req);
    if (!authToken) {
      next();
      return
    };

    let auth = await jwt.verifyJWT(authToken);
    if (auth.status === "invalid") {
      next();
      return;
    };
    try {
      var user = new db.User(auth.data.userID);
      await user.hydrateData();
    } catch (err) {
      next()
      return
    }
    if (auth.status === "expired") {
      let refreshToken = authUtils.extractRefreshToken(req);
      
      if(!refreshToken) {
        next();
        return;
      }
      
      let stat = jwt.verifyRefreshToken(refreshToken, user);

      if (!stat) {
        next();
        return;
      }

      let newRefreshToken = await jwt.createRefreshToken(user);
      let newAuthToken = await jwt.createAuthToken(user);

      res.cookie("refreshToken", newRefreshToken, path="/api/auth" ,{ httpOnly: true });
      res.cookie("authToken", newAuthToken, { httpOnly: true });
    }
    res.redirect("/home")

}

export function authenticationMiddleware(refresh=false,ejspage=false) {

  return async (req, res, next) => {
    let authToken = authUtils.extractAuthToken(req);

    if (ejspage && !authToken) return res.redirect("/");
    if (!authToken) return authUtils.UnauthorizedResponse(res);
    let auth = await jwt.verifyJWT(authToken);
    if (auth.status === "invalid" || (auth.status==="expired" && !refresh)) {
      if(ejspage) return res.redirect("/");
      return authUtils.UnauthorizedResponse(res)
    };
    try {
      var user = new db.User(auth.data.userID);
      await user.hydrateData();
    } catch (err) {
      if(ejspage) return res.redirect("/");
      return authUtils.UnauthorizedResponse(res);
    }
    if (auth.status !== "valid") {
      let refreshToken = authUtils.extractRefreshToken(req);
      
      if(!refreshToken && ejspage) return res.redirect("/");
      if (!refreshToken) return authUtils.UnauthorizedResponse(res);
      
      let stat = jwt.verifyRefreshToken(refreshToken, user);

      if(!stat && ejspage) return res.redirect("/");
      if (!stat) return authUtils.UnauthorizedResponse(res);

      let newRefreshToken = await jwt.createRefreshToken(user);
      let newAuthToken = await jwt.createAuthToken(user);

      res.cookie("refreshToken", newRefreshToken,path="/refresh" ,{ httpOnly: true });
      res.cookie("authToken", newAuthToken, { httpOnly: true });
    }
    res.locals.user = user;
    next();
  }
}

export function authorizationMiddleware(allowedRole = authUtils.CUSTOMER,ejspage=false) {
  return (req, res, next) => {
    let user = res.locals.user;
    if (authUtils.roleMap[user.role] >= allowedRole) next();
    else {
      if(ejspage) return res.redirect("/");
      return authUtils.UnauthorizedResponse(res)
    };
  };
}

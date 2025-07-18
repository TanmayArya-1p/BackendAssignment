import jwt from "jsonwebtoken";
import db from "../db/index.js";

export async function createAuthToken(user) {
  if (!user.isHydrated()) await user.hydrate();
  let tok = {
    userID: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + Number(process.env.AUTH_TOKEN_EXPIRE),
  };
  let signedtok = jwt.sign(tok, process.env.JWT_SECRET_KEY);
  return signedtok;
}

export async function verifyJWT(token) {
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return { status: "valid", data: decoded };
  } catch (error) {
    decoded = jwt.decode(token, process.env.JWT_SECRET_KEY);
    if ((error.message = "jwt expired"))
      return { status: "expired", data: decoded };
    return { status: "invalid", data: decoded };
  }
}

export async function createRefreshToken(user) {
  let newJTI = await db.Jti.issueJti(user);
  let tok = {
    jti: newJTI,
    exp: Math.floor(
      Date.now() / 1000 + Number(process.env.REFRESH_TOKEN_EXPIRE),
    ),
  };
  return jwt.sign(tok, process.env.JWT_SECRET_KEY);
}

export async function verifyRefreshToken(token, user) {
  let stat = await verifyJWT(token);
  if (stat.status != "valid") return false;
  let jtistat = await db.Jti.checkJti(stat.data.jti, user, true);
  return jtistat;
}

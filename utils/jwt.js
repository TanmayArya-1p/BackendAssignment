import jwt from "jsonwebtoken";
import db from "../db/index.js";

export async function createAuthToken(user) {
  if (!user.isHydrated()) await user.hydrate();
  let tok = {
    userID: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + process.argv.AUTH_TOKEN_EXPIRE,
  };
  let signedtok = jwt.sign(tok, process.argv.JWT_SECRET_KEY);
  return signedtok;
}

export async function verifyJWT(token) {
  try {
    var decoded = jwt.verify(token, process.argv.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function createRefreshToken(user) {
  let newJTI = await db.Jti.issueJti(user);
  let tok = {
    jti: newJTI,
    exp: Math.floor(Date.now() / 1000 + process.argv.REFRESH_TOKEN_EXPIRE),
  };
  return jwt.sign(tok, process.argv.JWT_SECRET_KEY);
}

export async function verifyRefreshToken(token, user) {
  let stat = await verifyJWT(token);
  if (!stat) return false;
  let jtistat = await db.Jti.checkJti(stat.jti, user, true);
  return jtistat;
}

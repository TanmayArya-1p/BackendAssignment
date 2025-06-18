import db from "./db.js";

// JTI (JSON Token Identifer/ JSON ID) is a unique identifier for refresh tokens.
// JTI is officially defined in the JWT specificiation as a claim that provides a unique identifier for a JWT token.
// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7


export async function checkJti(jti, user, del = false) {
  const [rows] = await db.query(
    "SELECT * FROM refresh_jti WHERE jti = ? AND issued_by = ?",
    [jti, user.id],
  );
  if (del) {
    await db.query("DELETE FROM refresh_jti WHERE jti = ? AND issued_by = ?", [
      jti,
      user.id,
    ]);
  }
  return rows.length > 0;
}

export async function issueJti(user) {
  let expire = Math.floor(
    Date.now() / 1000 + Number(process.env.REFRESH_TOKEN_EXPIRE),
  );
  let [uuid] = await db.query("SELECT UUID() as uuid;");
  uuid = uuid[0].uuid;
  const [rows] = await db.query(
    "INSERT INTO refresh_jti (jti,issued_by,expires_at) VALUES (?, ?, ?)",
    [uuid, user.id, expire],
  );
  return uuid;
}

export async function cleanupJti() {
  await db.query("DELETE FROM refresh_jti WHERE expires_at < ?", [
    Date.now() / 1000,
  ]);
}

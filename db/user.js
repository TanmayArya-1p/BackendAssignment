import db from "./db.js";
import bcrypt from "bcrypt";

export async function getAllUsers() {
  let users = await db.query("SELECT * FROM users");
  return users[0];
}

export async function getUserById(id) {
  let user = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return user[0][0];
}

export async function getUserByUsername(username) {
  let user = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return user[0][0];
}

export async function createUser(username, password, role = "customer") {
  let hashedPwd = await bcrypt.hash(password, 10);
  let user = await db.query(
    "INSERT INTO users (username,password,role) VALUES (?,?,?)",
    [username, hashedPwd, role],
  );
  return getUserById(user[0].insertId);
}

export async function updateUser(id, username, password, role = "customer") {
  await db.query(
    "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
    [username, password, role, id],
  );
  let user = getUserById(id);
  return user;
}

export async function deleteUser(id) {
  let user = await getUserById(id);
  await db.query("DELETE FROM users WHERE id = ?", [id]);
  return user;
}

export async function verifyPassword(username, password) {
  let user = await getUserByUsername(username);
  if (!user) return [false, null];

  let compres = await bcrypt.compare(password, user.password);
  if (compres) return [true, user];
  return [false, null];
}

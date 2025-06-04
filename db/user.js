import db from "./db.js";
import bcrypt from "bcrypt";

export default class User {
  constructor(p) {
    this.hydrated = false;
    if (typeof p === "object") {
      Object.assign(this, p);
      if (
        this.id &&
        this.username &&
        this.password &&
        this.role &&
        this.created_at
      )
        this.hydrated = true;
    } else if (typeof p === "number") {
      this.id = p;
    } else {
      throw new Error("Invalid Parameter");
    }
  }

  async hydrateData() {
    let res = await User.getUserById(this.id);
    if (!res) throw new Error("User not found");
    Object.assign(this, res);
    this.hydrated = true;
    return this;
  }

  async create() {
    if (!this.username || !this.password)
      throw new Error("Username and password are required");

    let username = this.username;
    let password = this.password;
    let role = this.role ? this.role : "customer";

    let hashedPwd = await bcrypt.hash(password, 10);
    let cid = await db.query(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)",
      [username, hashedPwd, role],
    );
    cid = cid[0].insertId;
    this.id = cid;
    await this.hydrateData();
    return this;
  }

  static async getUserById(id) {
    let user = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!user[0][0]) throw new Error(id + " User not found");
    return User.#deriveUser(user[0][0]);
  }

  static async getAllUsers() {
    let users = await db.query("SELECT * FROM users");
    return users[0].map((a) => User.#deriveUser(a));
  }

  static async getUserByUsername(username) {
    let user = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return User.#deriveUser(user[0][0]);
  }

  async updateUser(username, password, role = "customer") {
    await db.query(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, password, role, this.id],
    );
    this.username = username;
    this.password = password;
    this.role = role;
    return this;
  }

  async delete() {
    await db.query("DELETE FROM users WHERE id = ?", [this.id]);
    return this;
  }

  async verifyPassword(password) {
    if (!this.hydrated) throw new Error("User data not hydrated");

    let compres = await bcrypt.compare(password, this.password);
    if (compres) return true;
    return false;
  }

  static #deriveUser(obj) {
    let us = new User(obj.id);
    Object.assign(us, obj);
    return us;
  }
}

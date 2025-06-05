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
        this.HashedPassword &&
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

  isHydrated() {
    if (
      this.id &&
      this.username &&
      this.HashedPassword &&
      this.role &&
      this.created_at
    )
      this.hydrated = true;
    return this.hydrated;
  }

  async hydrateData() {
    let oldpass = this.password;

    let res = this.id
      ? await User.getUserById(this.id)
      : this.username
        ? await User.getUserByUsername(username)
        : -1;

    if (res === -1)
      throw new Error("Either username or id has to be provided.");

    if (!res) throw new Error("User not found");
    Object.assign(this, res);
    this.HashedPassword = this.password;
    this.password = oldpass;
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
    this.HashedPassword = hashedPwd;
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

  static async getAllUsers(limit = 10, offset = 0) {
    if (limit === -1) var users = await db.query("SELECT * FROM users");
    else
      var users = await db.query("SELECT * FROM users LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);
    return users[0].map((a) => User.#deriveUser(a));
  }

  static async getUserByUsername(username) {
    let user = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return User.#deriveUser(user[0][0]);
  }

  async updateUser(username, PlainTextPassword, role = "customer") {
    let hashedPwd = await bcrypt.hash(PlainTextPassword, 10);
    await db.query(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, hashedPwd, role, this.id],
    );
    this.username = username;
    this.password = PlainTextPassword;
    this.HashedPassword = hashedPwd;
    this.role = role;
    return this;
  }

  async delete() {
    await db.query("DELETE FROM users WHERE id = ?", [this.id]);
    return this;
  }

  async verifyPassword(password) {
    if (!this.isHydrated()) await this.hydrateData();

    let compres = await bcrypt.compare(password, this.HashedPassword);
    if (compres) return true;
    return false;
  }

  static #deriveUser(obj) {
    let us = new User(obj.id);
    us.HashedPassword = us.password;
    us.password = "";
    Object.assign(us, obj);
    return us;
  }
}

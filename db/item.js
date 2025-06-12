import db from "./db.js";
import * as tags from "./tags.js";
import * as utils from "../utils/diff.js";

export default class Item {
  constructor(p) {
    this.hydrated = false;
    if (typeof p === "object") {
      Object.assign(this, p);
      if (
        this.id &&
        this.name &&
        this.description != undefined &&
        this.price &&
        this.image
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
      this.name &&
      this.description != undefined &&
      this.price &&
      this.image
    )
      this.hydrated = true;
    return this.hydrated;
  }

  async hydrate() {
    let res = await Item.getItemById(this.id);
    Object.assign(this, res);
    this.hydrated = true;
  }

  async create() {
    if (!this.name || this.description == undefined || !this.price)
      throw new Error("Not all required parameters are provided");

    let newID = null;
    if (this.image)
      newID = await db.query(
        "INSERT INTO items (name, description, price, image) VALUES (?, ?, ?, ?)",
        [this.name, this.description, this.price, this.image],
      );
    else
      newID = await db.query(
        "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
        [this.name, this.description, this.price],
      );
    newID = newID[0].insertId;
    this.id = newID;
    let item = await Item.getItemById(newID);
    if (this.tags && this.tags.length > 0) {
      for (const tag of this.tags) {
        if (!(await tags.giveItemTagByName(this.id, tag))) {
          let newtag_id = await tags.createTag(tag);
          await tags.giveItemTag(this.id, newtag_id);
        }
      }
    }
    this.image = item.image;
    this.hydrated = true;
    return this;
  }

  async delete() {
    await tags.deleteAllItemTags(this.id);
    await db.query("DELETE FROM items WHERE id = ?", [this.id]);
    return this;
  }

  async updateItem({
    name = null,
    description = null,
    price = null,
    image = null,
    updtags = ["NOAC"],
  }) {
    if (!name) name = this.name;
    if (!description) description = this.description;
    if (!price) price = this.price;
    if (!image) image = this.image;

    if (updtags.length != 1 || updtags[0] !== "NOAC") {
      let prevItem = this;
      let diffs = new utils.DiffGenerator(prevItem.tags, updtags).calculate();
      console.log(diffs, updtags);
      for (const newTag of diffs.added) {
        let tstat = await tags.giveItemTagByName(this.id, newTag);
        if (!tstat) {
          await tags.createTag(newTag);
          await tags.giveItemTagByName(this.id, newTag);
        }
      }
      for (const oldTag of diffs.deleted) {
        await tags.removeItemTagByName(this.id, oldTag);
      }
      this.tags = updtags;
    }

    await db.query(
      "UPDATE items SET name = ?, description = ?, price = ?, image = ? WHERE id = ?",
      [name, description, price, image, this.id],
    );
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
    this.tags = await tags.getItemTags(this.id);

    return this;
  }

  static async getItemById(id) {
    let item = await db.query("SELECT * FROM items WHERE id = ?", [id]);
    if (!item[0][0]) throw new Error("Item not found");
    let uptags = await tags.getItemTags(id);
    item[0][0].tags = uptags;
    return Item.#deriveItem(item[0][0]);
  }

  static async getAllItems(limit = 8, offset = 0) {
    var items;
    if (limit !== -1) {
      items = await db.query("SELECT * FROM items LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);
    } else items = await db.query("SELECT * FROM items");
    for (let i = 0; i < items[0].length; i++)
      items[0][i].tags = await tags.getItemTags(items[0][i].id);
    return items[0].map((a) => Item.#deriveItem(a));
  }

  static #deriveItem(obj) {
    let res = new Item(obj);
    if (res.id && res.name && res.description && res.price && res.image) {
      res.hydrated = true;
    }
    return res;
  }

  static async getItemsofTag(tag_names = []) {
    let inPl = tag_names.map((_) => `?`).join(",");
    console.log(
      "QUERY STRING",
      `SELECT DISTINCT  items.id,items.name,items.description,items.price,items.image FROM items INNER JOIN tag_rel ON items.id=tag_rel.item_id LEFT JOIN tags ON tags.id=tag_rel.tag_id WHERE tags.name IN (${inPl})`,
    );
    let items = await db.query(
      `SELECT DISTINCT  items.id,items.name,items.description,items.price,items.image FROM items INNER JOIN tag_rel ON items.id=tag_rel.item_id LEFT JOIN tags ON tags.id=tag_rel.tag_id WHERE tags.name IN (${inPl})`,
      tag_names,
    );
    if (!items[0]) return [];
    return await Promise.all(
      items[0].map(async (a) => await Item.getItemById(a.id)),
    );
  }
}

//TODO : OPENAPI SPEC WITH SWAGGER DOCS FOR CONTROLLER

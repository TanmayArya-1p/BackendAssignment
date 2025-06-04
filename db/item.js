import db from "./db.js";
import * as tags from "./tags.js";
import * as utils from "../utils.js";

export async function getItemById(id) {
  let item = await db.query("SELECT * FROM items WHERE id = ?", [id]);
  let tags = await tags.getItemTags(id);
  item[0][0].tags = tags;
  return item[0][0];
}

//TODO : OPENAPI SPEC WITH SWAGGER DOCS FOR CONTROLLER

export async function getAllItems() {
  let items = await db.query("SELECT * FROM items");
  for (let i = 0; i < items[0].length; i++)
    items[0][i].tags = await tags.getItemTags(items[0][i].id);
  return items[0];
}

export async function createItem(name, description, price, tags = []) {
  let newID = await db.query(
    "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
    [name, description, price],
  ).insertId;
  let item = await getItemById(newID);
  for (let tag of tags) {
    await tags.giveItemTagByName(item.id, tag);
  }
  return item;
}

export async function updateItem(
  id,
  name,
  description,
  price,
  tags = ["NOAC"],
) {
  if (tags != ["NOAC"]) {
    let prevItem = getItemById(id);
    let diffs = new utils.DiffGenerator(prevItem.tags, tags);
    for (newTag in diffs.added) {
      tags.giveItemTagByName(id, newTag);
    }
    for (oldTag in diffs.deleted) {
      tags.removeItemTagByName(id, oldTag);
    }
  }

  await db.query(
    "UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?",
    [name, description, price, id],
  );
  let item = await getItemById(id);
  return item;
}

export async function deleteItem(id) {
  let item = await getItemById(id);
  await db.query("DELETE FROM items WHERE id = ?", [id]);
  await tags.deleteAllItemTags(id);
  return item;
}

import db from "./db.js";

export async function createTag(name) {
  let id = await db.query("INSERT INTO tags (name) VALUES (?)", [name]);
  id = id[0].insertId;
  return id;
}

export async function getTag(id) {
  let tag = await db.query("SELECT * FROM tags WHERE id = ?", [id]);
  if (!tag[0][0]) throw new Error(`Tag with ${id} not found`);
  return tag[0][0];
}

export async function tagExists(name) {
  let tag = await db.query("SELECT * FROM tags WHERE name = ?", [name]);
  if (tag[0].length > 0) return [true, tag[0][0]];
  return [false, null];
}

export async function deleteTag(id) {
  await db.query("DELETE FROM tags WHERE id = ?", [id]);
}

export async function giveItemTag(item_id, tag_id) {
  await db.query("INSERT INTO tag_rel (item_id, tag_id) VALUES (?, ?)", [
    item_id,
    tag_id,
  ]);
}

export async function giveItemTagByName(item_id, tag_name) {
  let tag = await tagExists(tag_name);
  if (!tag[0]) return false;
  await giveItemTag(item_id, tag[1].id);
  return true;
}

export async function removeItemTag(item_id, tag_id) {
  await db.query("DELETE FROM tag_rel WHERE item_id = ? AND tag_id = ?", [
    item_id,
    tag_id,
  ]);
}

export async function removeItemTagByName(item_id, tag_name) {
  let tag = await tagExists(tag_name);
  if (!tag[0]) return false;
  await removeItemTag(item_id, tag[1].id);
  return true;
}

export async function getItemTags(item_id) {
  let tag_res = await db.query("SELECT * FROM tag_rel WHERE item_id=?", [
    item_id,
  ]);
  tag_res = tag_res[0];
  let otpt = [];
  for (let i = 0; i < tag_res.length; i++) {
    let tag = await getTag(tag_res[i].tag_id);
    otpt.push([tag.id, tag.name]);
  }
  for (let tag of otpt) {
    await tag;
  }
  return otpt;
}

export async function deleteAllItemTags(item_id) {
  await db.query("DELETE FROM tag_rel WHERE item_id = ?", [item_id]);
}

export async function getAllTags() {
  let tags = await db.query("SELECT * FROM tags");
  if (!tags[0]) return [];
  return tags[0];
}

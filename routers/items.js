import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";
import fileUpload from "express-fileupload";
import path from "path";

let router = express.Router();

router.use(express.json());
router.use(fileUpload());

router.get(
  "/",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);

    if (isNaN(limit)) limit = -1;
    if (isNaN(offset)) offset = 0;

    let items = await db.Item.getAllItems(limit, offset);
    res.send(items);
  },
);

router.get(
  "/:itemid",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    try {
      let item = await db.Item.getItemById(Number(req.params.itemid));
      res.send(item);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

router.post(
  "/",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    if (!req.body.tags) req.body.tags = [];
    try {
      let item = new db.Item({
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        tags: req.body.tags,
      });
      item = await item.create();
      res.send(item);
    } catch (err) {
      res.status(400).send({ message: "Invalid request : " + err });
    }
  },
);

router.delete(
  "/:itemid",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    try {
      let item = new db.Item(Number(req.params.itemid));
      await item.hydrate();
      res.send(await item.delete());
    } catch (err) {
      res.status(400).send({ message: "Invalid request : " + err });
    }
  },
);

router.put(
  "/:itemid",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    try {
      let item = new db.Item(Number(req.params.itemid));
      await item.hydrate();
      if (!req.body.tags) req.body.tags = ["NOAC"];
      res.send(
        await item.updateItem({
          name: req.body.name,
          description: req.body.description,
          price: Number(req.body.price),
          updtags: req.body.tags,
        }),
      );
    } catch (err) {
      res.status(500).send({ message: "Internal Server Error : " + err });
    }
  },
);


router.post('/upload',   
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  (req, res) => {
  const { image } = req.files;
  if (!image) return res.sendStatus(400);
  image.mv(path.join(process.cwd(), '/public/images', image.name));

  res.status(200).send({ message: "File uploaded successfully" });
});


router.get(
  "/tags",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    res.send(await db.Tags.getAllTags());
  },
);

export default router;

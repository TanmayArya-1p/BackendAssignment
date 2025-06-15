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

/**
 * @openapi
 * /api/items/tags:
 *   get:
 *     summary: Get all existing item tags
 *     security:
 *        - AuthHeader: []
 *     tags:
 *      - Items
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: string
 */
router.get(
  "/tags",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    res.send(await db.Tags.getAllTags());
  },
);

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: Get items
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of items to return
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Initial offset for pagination
 *         required: false
 *         schema:
 *           type: integer
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);

    if (isNaN(limit)) limit = -1;
    if (isNaN(offset)) offset = 0;
    if(limit<-1 || order<0) {
      res.status(400).send({message:"Invalid params"})
    }

    let items = await db.Item.getAllItems(limit, offset);
    res.send(items);
  },
);

/**
 * @openapi
 * /api/items/{itemid}:
 *   get:
 *     summary: Get specific item by itemID
 *     parameters:
 *       - in: path
 *         name: itemid
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of item to get
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/:itemid",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CUSTOMER),
  async (req, res) => {
    try {
      let item = await db.Item.getItemById(Number(req.params.itemid));
      res.send(item);
    } catch (err) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

/**
 * @openapi
 * /api/items:
 *   post:
 *     summary: Create new item
 *     description: Need to have authorization of CHEF or above to perform this request
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    if (!req.body.tags) req.body.tags = [];
    try {
      let itemobj = {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        tags: req.body.tags,
      };
      if (req.body.image) itemobj.image = req.body.image;
      let item = new db.Item(itemobj);
      item = await item.create();
      res.send(item);
    } catch (err) {
      res.status(400).send({ message: "Invalid request : " + err });
    }
  },
);

/**
 * @openapi
 * /api/items/{itemid}:
 *   delete:
 *     summary: Delete item
 *     description: Need to have authorization of CHEF or above to perform this request
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     parameters:
 *       - name: itemid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
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

/**
 * @openapi
 * /api/items/{itemid}:
 *   put:
 *     summary: Update an existing item's properties
 *     description: Need to have authorization of CHEF or above to perform this request
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     parameters:
 *       - name: itemid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *      content:
 *        application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: false
 *               description:
 *                 type: string
 *                 required: false
 *               price:
 *                 type: number
 *                 required: false
 *               tags:
 *                 type: array
 *                 required: false
 *                 items:
 *                   type: string
 *
 *     responses:
 *       200:
 *         description: Success
 */
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
          image: req.body.image,
        }),
      );
    } catch (err) {
      res.status(500).send({ message: "Internal Server Error : " + err });
    }
  },
);

/**
 * @openapi
 * /api/items/upload:
 *   post:
 *     summary: Upload image of an item
 *     description: Need to have authorization of CHEF or above to perform this request
 *     security:
 *        - AuthHeader: []
 *     tags:
 *       - Items
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: binary
 *
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
  "/upload",
  authMiddleware.authenticationMiddleware(),
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  (req, res) => {
    if (!req.files) return res.sendStatus(400);
    const { image } = req.files;
    if (!image) return res.sendStatus(400);
    image.mv(path.join(process.cwd(), "/public/images", image.name));

    res.status(200).send({ message: "File uploaded successfully" });
  },
);

export default router;

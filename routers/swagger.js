import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "InOrder API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        AuthHeader: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
        },
        RefreshHeader: {
          type: "apiKey",
          in: "header",
          name: "refreshToken",
        },
      },
    },
  },

  security: [
    {
      AuthHeader: [],
      RefreshHeader: [],
    },
  ],
  apis: ["./routers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const router = express.Router();

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(swaggerSpec, false, {
    docExpansion: "none",
  }),
);

export default router;

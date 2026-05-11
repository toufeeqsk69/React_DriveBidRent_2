import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import openApiDefinition from "./openapi.js";

const swaggerSpec = swaggerJSDoc({
  definition: openApiDefinition,
  apis: []
});

export const setupSwagger = (app) => {
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "DriveBidRent API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );
};

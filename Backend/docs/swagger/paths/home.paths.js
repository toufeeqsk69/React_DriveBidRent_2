const homePaths = {
  "/api/home/data": {
    get: {
      tags: ["Home"],
      summary: "Get public homepage data",
      responses: {
        200: {
          description: "Homepage data fetched",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        }
      }
    }
  }
};

export default homePaths;

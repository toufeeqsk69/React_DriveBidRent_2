const adminSecurity = [{ cookieAuth: [] }];

const adminPaths = {
  "/api/admin/admin": {
    get: {
      tags: ["Admin"],
      summary: "Get admin dashboard",
      security: adminSecurity,
      responses: { 200: { description: "Dashboard fetched" } }
    }
  },
  "/api/admin/manage-user": {
    get: {
      tags: ["Admin"],
      summary: "Get user management data",
      security: adminSecurity,
      responses: { 200: { description: "Users fetched" } }
    }
  },
  "/api/admin/user-details/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Get one user details",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User details fetched" } }
    }
  },
  "/api/admin/block-user/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Block a user",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User blocked" } }
    }
  },
  "/api/admin/approve-user/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Approve mechanic user",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User approved" } }
    }
  },
  "/api/admin/decline-user/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Decline user",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User declined" } }
    }
  },
  "/api/admin/delete-buyer/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Delete buyer",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Buyer deleted" } }
    }
  },
  "/api/admin/delete-seller/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Delete seller",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Seller deleted" } }
    }
  },
  "/api/admin/auction-managers": {
    get: {
      tags: ["Admin"],
      summary: "Get auction manager list",
      security: adminSecurity,
      responses: { 200: { description: "Auction managers fetched" } }
    }
  },
  "/api/admin/approve-auction-manager/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Approve auction manager",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction manager approved" } }
    }
  },
  "/api/admin/disapprove-auction-manager/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Disapprove auction manager",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction manager disapproved" } }
    }
  },
  "/api/admin/delete-auction-manager/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Delete auction manager",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction manager deleted" } }
    }
  },
  "/api/admin/analytics": {
    get: {
      tags: ["Admin"],
      summary: "Get admin analytics",
      security: adminSecurity,
      responses: { 200: { description: "Analytics fetched" } }
    }
  },
  "/api/admin/manage-earnings": {
    get: {
      tags: ["Admin"],
      summary: "Get earnings management data",
      security: adminSecurity,
      responses: { 200: { description: "Earnings fetched" } }
    }
  },
  "/api/admin/admin-profile": {
    get: {
      tags: ["Admin"],
      summary: "Get admin profile",
      security: adminSecurity,
      responses: { 200: { description: "Admin profile fetched" } }
    }
  },
  "/api/admin/update-admin-password": {
    post: {
      tags: ["Admin"],
      summary: "Update admin password",
      security: adminSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword", "confirmPassword"],
              properties: {
                currentPassword: { type: "string", example: "Admin@123" },
                newPassword: { type: "string", minLength: 8, example: "Admin@1234" },
                confirmPassword: { type: "string", minLength: 8, example: "Admin@1234" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Admin password updated" } }
    }
  }
};

export default adminPaths;

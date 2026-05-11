const superadminSecurity = [{ cookieAuth: [] }];

const superadminPaths = {
  "/api/superadmin/dashboard": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin dashboard",
      security: superadminSecurity,
      responses: { 200: { description: "Dashboard fetched" } }
    }
  },
  "/api/superadmin/analytics": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin analytics",
      security: superadminSecurity,
      responses: { 200: { description: "Analytics fetched" } }
    }
  },
  "/api/superadmin/user-activities": {
    get: {
      tags: ["Superadmin"],
      summary: "Get user activity list",
      security: superadminSecurity,
      responses: { 200: { description: "User activities fetched" } }
    }
  },
  "/api/superadmin/user-details/{id}": {
    get: {
      tags: ["Superadmin"],
      summary: "Get one user details",
      security: superadminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User details fetched" } }
    }
  },
  "/api/superadmin/revenue": {
    get: {
      tags: ["Superadmin"],
      summary: "Get revenue report",
      security: superadminSecurity,
      responses: { 200: { description: "Revenue data fetched" } }
    }
  },
  "/api/superadmin/trends": {
    get: {
      tags: ["Superadmin"],
      summary: "Get growth trends",
      security: superadminSecurity,
      responses: { 200: { description: "Trends fetched" } }
    }
  },
  "/api/superadmin/profile": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin profile",
      security: superadminSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/superadmin/update-password": {
    post: {
      tags: ["Superadmin"],
      summary: "Update superadmin password",
      security: superadminSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: { type: "string", example: "Superadmin@123" },
                newPassword: { type: "string", minLength: 8, example: "Superadmin@1234" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Password updated" } }
    }
  },
  "/api/superadmin/create-admin": {
    post: {
      tags: ["Superadmin"],
      summary: "Create admin account",
      security: superadminSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firstName", "lastName", "email", "phone", "password", "dateOfBirth", "city"],
              properties: {
                firstName: { type: "string", example: "Admin" },
                lastName: { type: "string", example: "User" },
                email: { type: "string", format: "email", example: "admin@example.com" },
                phone: { type: "string", example: "9876543210" },
                password: { type: "string", minLength: 8, example: "StrongPass123" },
                dateOfBirth: { type: "string", format: "date", example: "1992-01-10" },
                city: { type: "string", example: "Kochi" }
              }
            }
          }
        }
      },
      responses: { 201: { description: "Admin created" }, 400: { description: "Validation error" } }
    }
  }
};

export default superadminPaths;

const auctionManagerSecurity = [{ cookieAuth: [] }];

const auctionManagerPaths = {
  "/api/auctionmanager/dashboard": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction manager dashboard",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Dashboard data fetched" } }
    }
  },
  "/api/auctionmanager/requests": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction requests",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Requests fetched" } }
    }
  },
  "/api/auctionmanager/pending": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get pending inspection vehicles",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Pending list fetched" } }
    }
  },
  "/api/auctionmanager/get-review/{id}": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get mechanic review for a car",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Review fetched" } }
    }
  },
  "/api/auctionmanager/update-status/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Update car status (approve or reject)",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "string", enum: ["approved", "rejected"], example: "approved" },
                startingBid: { type: "number", example: 500000 }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Status updated" },
        400: { description: "Validation failure" }
      }
    }
  },
  "/api/auctionmanager/reject-request/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Reject a pending car request",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rejectionReason"],
              properties: {
                rejectionReason: { type: "string", example: "Missing important documentation" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Request rejected successfully" },
        400: { description: "Validation failure or rejectionReason missing" },
        404: { description: "Request not found" },
        500: { description: "Server error" }
      }
    }
  },
  "/api/auctionmanager/pending-car-details/{id}": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get pending car full details",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Car details fetched" } }
    }
  },
  "/api/auctionmanager/approved": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get approved cars",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Approved list fetched" } }
    }
  },
  "/api/auctionmanager/assign-mechanic/{id}": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get assign mechanic page data",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Data loaded" } }
    },
    post: {
      tags: ["Auction Manager"],
      summary: "Assign mechanic to vehicle",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["mechanicId"],
              properties: {
                mechanicId: { type: "string", example: "65f2d9b7a5f13e1d2a4b9c11" },
                mechanicName: { type: "string", example: "Arun Kumar" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Mechanic assigned" },
        400: { description: "Invalid payload or city mismatch" },
        404: { description: "Request or mechanic not found" },
        500: { description: "Server error" }
      }
    }
  },
  "/api/auctionmanager/start-auction/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Start auction",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction started" } }
    }
  },
  "/api/auctionmanager/stop-auction/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Stop auction",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction stopped" } }
    }
  },
  "/api/auctionmanager/view-bids/{id}": {
    get: {
      tags: ["Auction Manager"],
      summary: "View bids for assigned auction",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Bids loaded" } }
    }
  },
  "/api/auctionmanager/re-auction/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Re-open an ended auction after payment failure",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction re-opened" } }
    }
  },
  "/api/auctionmanager/profile": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction manager profile",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/auctionmanager/update-phone": {
    post: {
      tags: ["Auction Manager"],
      summary: "Update auction manager phone number",
      security: auctionManagerSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["phone"],
              properties: {
                phone: { type: "string", pattern: "^\\d{10}$", example: "9876543210" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Phone updated" } }
    }
  },
  "/api/auctionmanager/change-password": {
    post: {
      tags: ["Auction Manager"],
      summary: "Change auction manager password",
      security: auctionManagerSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword"],
              properties: {
                oldPassword: { type: "string", example: "CurrentPass123" },
                newPassword: { type: "string", minLength: 8, example: "NewStrongPass123" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Password changed" } }
    }
  }
};

export default auctionManagerPaths;

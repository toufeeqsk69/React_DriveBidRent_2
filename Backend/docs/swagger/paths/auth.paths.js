const authPaths = {
  "/api/auth/signup": {
    post: {
      tags: ["Auth"],
      summary: "Register a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SignupRequest" }
          }
        }
      },
      responses: {
        201: {
          description: "User registered",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        500: { $ref: "#/components/responses/ServerError" }
      }
    }
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Login successful and jwt cookie set",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        },
        401: { $ref: "#/components/responses/Unauthorized" }
      }
    }
  },
  "/api/auth/google": {
    post: {
      tags: ["Auth"],
      summary: "Login or signup with Google",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string", example: "google-id-token" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Google auth success" } }
    }
  },
  "/api/auth/verify-signup-otp": {
    post: {
      tags: ["Auth"],
      summary: "Verify OTP for signup",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "otp"],
              properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                otp: { type: "string", example: "123456" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "OTP verified" } }
    }
  },
  "/api/auth/logout": {
    get: {
      tags: ["Auth"],
      summary: "Logout current user",
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/auctionmanager/signup": {
    post: {
      tags: ["Auction Manager Auth"],
      summary: "Register auction manager",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SignupRequest" }
          }
        }
      },
      responses: {
        201: {
          description: "Auction manager registered",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/auctionmanager/login": {
    post: {
      tags: ["Auction Manager Auth"],
      summary: "Login auction manager",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/auctionmanager/logout": {
    get: {
      tags: ["Auction Manager Auth"],
      summary: "Logout auction manager",
      responses: { 200: { description: "Logout successful" } }
    }
  }
};

export default authPaths;

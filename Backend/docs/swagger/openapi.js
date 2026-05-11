import { schemas, responses } from "./components/schemas.js";
import authPaths from "./paths/auth.paths.js";
import homePaths from "./paths/home.paths.js";
import buyerPaths from "./paths/buyer.paths.js";
import sellerPaths from "./paths/seller.paths.js";
import auctionManagerPaths from "./paths/auctionManager.paths.js";
import mechanicPaths from "./paths/mechanic.paths.js";
import adminPaths from "./paths/admin.paths.js";
import superadminPaths from "./paths/superadmin.paths.js";
import chatPaths from "./paths/chat.paths.js";
import inspectionChatPaths from "./paths/inspectionChat.paths.js";

const openApiDefinition = {
  openapi: "3.0.3",
  info: {
    title: "DriveBidRent Backend API",
    version: "1.0.0",
    description: "Role-based API docs for authentication, auction, rental, chat, and administration modules."
  },
  servers: [
    {
      url: process.env.BACKEND_URL || "http://localhost:8000",
      description: process.env.NODE_ENV === 'production' ? "Production environment" : "Local development"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Auction Manager Auth" },
    { name: "Home" },
    { name: "Buyer" },
    { name: "Seller" },
    { name: "Auction Manager" },
    { name: "Mechanic" },
    { name: "Admin" },
    { name: "Superadmin" },
    { name: "Chat" },
    { name: "Inspection Chat" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "jwt"
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas,
    responses
  },
  paths: {
    ...authPaths,
    ...homePaths,
    ...buyerPaths,
    ...sellerPaths,
    ...auctionManagerPaths,
    ...mechanicPaths,
    ...adminPaths,
    ...superadminPaths,
    ...chatPaths,
    ...inspectionChatPaths
  }
};

export default openApiDefinition;

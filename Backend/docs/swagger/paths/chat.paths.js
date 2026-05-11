const chatSecurity = [{ cookieAuth: [] }, { bearerAuth: [] }];

const chatPaths = {
  "/api/chat/my-chats": {
    get: {
      tags: ["Chat"],
      summary: "Get chats for logged-in user",
      security: chatSecurity,
      responses: { 200: { description: "Chats fetched" } }
    }
  },
  "/api/chat/{chatId}": {
    get: {
      tags: ["Chat"],
      summary: "Get a specific chat",
      security: chatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chat fetched" } }
    },
    delete: {
      tags: ["Chat"],
      summary: "Delete a chat",
      security: chatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chat deleted" } }
    }
  },
  "/api/chat/{chatId}/messages": {
    get: {
      tags: ["Chat"],
      summary: "Get messages from a chat",
      security: chatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Messages fetched" } }
    }
  },
  "/api/chat/{chatId}/message": {
    post: {
      tags: ["Chat"],
      summary: "Send a chat message",
      security: chatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/MessageRequest" } } }
      },
      responses: { 200: { description: "Message sent" } }
    }
  },
  "/api/chat/{chatId}/mark-read": {
    post: {
      tags: ["Chat"],
      summary: "Mark chat messages as read",
      security: chatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Messages marked read" } }
    }
  },
  "/api/chat/create/rental/{rentalId}": {
    post: {
      tags: ["Chat"],
      summary: "Create or get rental chat",
      security: chatSecurity,
      parameters: [{ name: "rentalId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chat created/fetched" } }
    }
  },
  "/api/chat/create/auction/{auctionId}": {
    post: {
      tags: ["Chat"],
      summary: "Create or get auction chat",
      security: chatSecurity,
      parameters: [{ name: "auctionId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Chat created/fetched" } }
    }
  }
};

export default chatPaths;

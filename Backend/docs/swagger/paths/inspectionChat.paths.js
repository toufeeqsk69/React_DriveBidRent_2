const inspectionChatSecurity = [{ cookieAuth: [] }, { bearerAuth: [] }];

const inspectionChatPaths = {
  "/api/inspection-chat/my-chats": {
    get: {
      tags: ["Inspection Chat"],
      summary: "Get inspection chats",
      security: inspectionChatSecurity,
      responses: { 200: { description: "Inspection chats fetched" } }
    }
  },
  "/api/inspection-chat/{chatId}": {
    get: {
      tags: ["Inspection Chat"],
      summary: "Get a specific inspection chat",
      security: inspectionChatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Inspection chat fetched" } }
    },
    delete: {
      tags: ["Inspection Chat"],
      summary: "Delete inspection chat",
      security: inspectionChatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Inspection chat deleted" } }
    }
  },
  "/api/inspection-chat/{chatId}/messages": {
    get: {
      tags: ["Inspection Chat"],
      summary: "Get inspection chat messages",
      security: inspectionChatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Messages fetched" } }
    }
  },
  "/api/inspection-chat/{chatId}/message": {
    post: {
      tags: ["Inspection Chat"],
      summary: "Send inspection chat message",
      security: inspectionChatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/MessageRequest" } } }
      },
      responses: { 200: { description: "Message sent" } }
    }
  },
  "/api/inspection-chat/{chatId}/mark-read": {
    post: {
      tags: ["Inspection Chat"],
      summary: "Mark inspection chat messages as read",
      security: inspectionChatSecurity,
      parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Messages marked read" } }
    }
  }
};

export default inspectionChatPaths;

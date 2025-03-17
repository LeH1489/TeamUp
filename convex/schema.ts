import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("admin"), v.literal("member")), //có thể admin hoặc member (coi phần validation của convex)
  })
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id("workspaces"),
  }).index("by_workspace_id", ["workspaceId"]),
  conversations: defineTable({
    workspaceId: v.id("workspaces"),
    memberOneId: v.id("members"), //member 1 who initiate the conversation
    memberTwoId: v.id("members"),
  }).index("by_workspace_id", ["workspaceId"]),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id("_storage")),
    memberId: v.id("members"), //member who sent the message
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")), //message can be in a channel or in direct message
    parentMessageId: v.optional(v.id("messages")), //message can be a reply to another message // thread
    updatedAt: v.optional(v.number()),
    conversationId: v.optional(v.id("conversations")),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_member_id", ["memberId"])
    .index("by_channel_id", ["channelId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_parent_message_id", ["parentMessageId"])
    .index("by_channel_id_parent_message_id_conversation_id", [
      "channelId",
      "parentMessageId",
      "conversationId",
    ]),
  reactions: defineTable({
    workspaceId: v.id("workspaces"),
    messageId: v.id("messages"),
    memberId: v.id("members"),
    value: v.string(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_message_id", ["messageId"])
    .index("by_member_id", ["memberId"]),
  events: defineTable({
    workspaceId: v.id("workspaces"),
    creatorId: v.id("members"),
    title: v.string(), // Tiêu đề: "Làm bài tập tuần 1"
    content: v.string(), // Nội dung: "Thầy yêu cầu làm 1 project nhỏ sử dụng HTML, CSS, JS"
    deadline: v.number(), // Deadline dưới dạng timestamp (milliseconds)
    status: v.union(v.literal("pending"), v.literal("expired")),
  })
    .index("by_workspace_id", ["workspaceId"]) // Tìm kiếm theo workspace
    .index("by_creator_id", ["creatorId"]) // Tìm kiếm theo người tạo
    .index("by_deadline", ["deadline"]) // Tìm kiếm theo deadline
    .index("by_workspace_id_status", ["workspaceId", "status"]) // Tìm kiếm theo workspace và trạng thái
    .index("by_workspace_id_deadline", ["workspaceId", "deadline"]),
  resources: defineTable({
    workspaceId: v.id("workspaces"),
    uploaderId: v.id("members"),
    name: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.string(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_uploader_id", ["uploaderId"])
    .index("by_file_type", ["fileType"])
    .index("by_workspace_id_file_type", ["workspaceId", "fileType"]),
});

export default schema;

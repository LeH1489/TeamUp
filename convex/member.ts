import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

//lấy thông tin user từ id
const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      );

    //user ko phải member của workspace thì trả về null
    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    return {
      ...member,
      user,
    };
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    //Kiểm tra authentication:
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    //Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return []; // // Nếu user không phải là thành viên của workspace này, trả về mảng rỗng
    }

    // Lấy tất cả thành viên trong workspace thông qua bảng members
    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const members = [];

    //Với mỗi thành viên, lấy thêm thông tin chi tiết của user tương ứng
    for (const member of data) {
      const user = await populateUser(ctx, member.userId);
      if (user) {
        members.push({ ...member, user });
      }
    }

    //Trả về danh sách thành viên đã được bổ sung thông tin user
    return members;

    //kq có dạng:
    // [
    //   {
    //     _id: "...",
    //     workspaceId: "...",
    //     userId: "...",
    //     role: "...",
    //     user: {
    //       _id: "...",
    //       name: "...",
    //       email: "...",
    //       // các thông tin khác của user
    //     }
    //   },
    //   // ... các thành viên khác
    // ]
  },
});

export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return member;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("members"),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("Admin cannot be removed");
    }

    //tự xóa chính mình
    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("Cannot remove self if self is admin");
    }

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), member._id)
          )
        )
        .collect(),
    ]);

    // // Xóa tuần tự từng message
    // for (const message of messages) {
    //   await ctx.db.delete(message._id);
    // }

    // // Sau khi xóa hết messages, mới bắt đầu xóa reactions
    // for (const reaction of reactions) {
    //   await ctx.db.delete(reaction._id);
    // }

    // // Sau khi xóa hết reactions, mới bắt đầu xóa conversations
    // for (const conversation of conversations) {
    //   await ctx.db.delete(conversation._id);
    // }

    await Promise.all([
      // Xóa messages song song
      Promise.all(messages.map((message) => ctx.db.delete(message._id))),

      // Xóa reactions song song
      Promise.all(reactions.map((reaction) => ctx.db.delete(reaction._id))),

      // Xóa conversations song song
      Promise.all(
        conversations.map((conversation) => ctx.db.delete(conversation._id))
      ),
    ]);

    await ctx.db.delete(args.id);

    //todo: remove member

    return args.id;
  },
});

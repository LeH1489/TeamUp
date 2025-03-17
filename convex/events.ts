import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
    deadline: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Lấy thông tin member hiện tại
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) throw new Error("Not a member of this workspace");

    // Kiểm tra xem member có phải là admin không
    if (currentMember.role !== "admin") {
      throw new Error("Only admins can create events");
    }

    const eventId = await ctx.db.insert("events", {
      workspaceId: args.workspaceId,
      creatorId: currentMember._id,
      title: args.title,
      content: args.content,
      deadline: args.deadline,
      status: "pending",
    });
    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("expired"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Lấy thông tin sự kiện
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // Lấy thông tin member hiện tại
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", event.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) throw new Error("Not a member of this workspace");

    // Kiểm tra xem member có phải là admin không
    if (currentMember.role !== "admin") {
      throw new Error("Only admins can update events");
    }

    // Cập nhật sự kiện
    const updates: any = {};

    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.deadline !== undefined) updates.deadline = args.deadline;
    if (args.status !== undefined) updates.status = args.status;

    const eventId = await ctx.db.patch(args.id, updates);
    return eventId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Lấy thông tin sự kiện
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // Lấy thông tin member hiện tại
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", event.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) throw new Error("Not a member of this workspace");

    // Kiểm tra xem member có phải là admin không
    if (currentMember.role !== "admin") {
      throw new Error("Only admins can delete events");
    }

    // Xóa sự kiện
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return [];

    // Lấy danh sách sự kiện
    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      );

    const events = await eventsQuery.collect();

    // Populate creator information
    const eventsWithCreator = await Promise.all(
      events.map(async (event) => {
        const creator = await ctx.db.get(event.creatorId);
        const creatorUser = creator ? await ctx.db.get(creator.userId) : null;

        return {
          ...event,
          creator: creatorUser
            ? {
                name: creatorUser.name,
                image: creatorUser.image,
              }
            : null,
        };
      })
    );

    // Sắp xếp events theo deadline (gần nhất lên đầu)
    const sortedEvents = eventsWithCreator.sort((a, b) => {
      return a.deadline - b.deadline;
    });

    return sortedEvents;
  },
});

export const getById = query({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Lấy thông tin sự kiện
    const event = await ctx.db.get(args.id);
    if (!event) return null;

    // Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", event.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    // Lấy thông tin creator
    const creator = await ctx.db.get(event.creatorId);
    const creatorUser = creator ? await ctx.db.get(creator.userId) : null;

    return {
      ...event,
      creator: creatorUser
        ? {
            name: creatorUser.name,
            image: creatorUser.image,
          }
        : null,
    };
  },
});

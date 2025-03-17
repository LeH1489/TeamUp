import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

//upload file to convex: https://docs.convex.dev/file-storage/upload-files
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Lấy danh sách tài liệu trong workspace
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await populateUser(ctx, userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!member) {
      throw new Error("Not a member of this workspace");
    }

    // Xây dựng query
    let resourcesQuery = ctx.db
      .query("resources")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      );

    // Lấy danh sách tài liệu
    const resources = await resourcesQuery.collect();

    // Lấy thông tin uploader cho mỗi tài liệu
    const resourcesWithUploader = await Promise.all(
      resources.map(async (resource) => {
        const uploader = await ctx.db.get(resource.uploaderId);
        const uploaderUser = uploader
          ? await ctx.db.get(uploader.userId)
          : null;

        // Lấy URL từ fileId
        const url = await ctx.storage.getUrl(resource.fileId);

        return {
          ...resource,
          url,
          uploader: uploaderUser
            ? {
                name: uploaderUser.name,
                image: uploaderUser.image,
              }
            : undefined,
        };
      })
    );

    return resourcesWithUploader;
  },
});

// Tải lên tài liệu mới
export const upload = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await populateUser(ctx, userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!member) {
      throw new Error("Not a member of this workspace");
    }

    // Tạo tài liệu mới
    const resourceId = await ctx.db.insert("resources", {
      workspaceId: args.workspaceId,
      uploaderId: member._id,
      name: args.name,
      description: args.description,
      fileId: args.fileId,
      fileType: args.fileType,
    });

    return resourceId;
  },
});

// ... existing code ...

export const remove = mutation({
  args: {
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await populateUser(ctx, userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Lấy thông tin resource trước khi xóa
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }

    // Kiểm tra xem user có phải là member của workspace không
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", resource.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!member) {
      throw new Error("Not a member of this workspace");
    }

    // Xóa file từ storage
    await ctx.storage.delete(resource.fileId);

    // Xóa resource từ database
    await ctx.db.delete(args.resourceId);

    return args.resourceId;
  },
});

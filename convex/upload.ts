import { mutation } from "./_generated/server";

//upload file to convex: https://docs.convex.dev/file-storage/upload-files
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetResourcesProps {
  workspaceId: Id<"workspaces">;
}

export const useGetResources = ({ workspaceId }: UseGetResourcesProps) => {
  const data = useQuery(api.resources.list, {
    workspaceId,
  });

  const isLoading = data === undefined;

  return { data, isLoading };
};

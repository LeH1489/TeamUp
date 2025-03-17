import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetEventProps {
  workspaceId: Id<"workspaces">;
}

export const useGetEvents = ({ workspaceId }: UseGetEventProps) => {
  const data = useQuery(api.events.list, { workspaceId });
  const isLoading = data === undefined;

  return { data, isLoading };
};

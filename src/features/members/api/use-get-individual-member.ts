import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetIndividualMemberProps {
  id: Id<"members">;
}

export const useGetIndividualMember = ({ id }: UseGetIndividualMemberProps) => {
  const data = useQuery(api.member.getById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};

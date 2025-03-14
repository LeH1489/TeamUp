import { useQueryState } from "nuqs";

export const useProfileMemberId = () => {
  //vd: [parentMessageId, setParentMessageId] = useState(123)
  // => https://example.com?parentMessageId=123
  return useQueryState("profileMemberId");
};

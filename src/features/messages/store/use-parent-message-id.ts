import { useQueryState } from "nuqs";

export const useParentMessageId = () => {
  //vd: [parentMessageId, setParentMessageId] = useState(123)
  // => https://example.com?parentMessageId=123
  return useQueryState("parentMessageId");
};

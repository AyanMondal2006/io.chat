import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("iochat_token");
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] !== "authUser",
      });
    },
  });

  return { logoutMutation, isPending, error };
};

export default useLogout;

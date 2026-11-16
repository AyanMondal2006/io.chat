import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUserQuery = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  return {
    authUser: authUserQuery.data?.user ?? null,
    isLoading: authUserQuery.isLoading,
    isError: authUserQuery.isError,
    error: authUserQuery.error,
    refetch: authUserQuery.refetch,
  };
};

export default useAuthUser;

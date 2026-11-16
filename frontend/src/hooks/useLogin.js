import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../lib/api.js';

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("iochat_token", data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;

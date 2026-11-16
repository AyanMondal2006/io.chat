import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api.js';

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("iochat_token", data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { isPending, error, signupMutation: mutate };
};

export default useSignUp;

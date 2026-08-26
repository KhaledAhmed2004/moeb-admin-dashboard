import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<LoginResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.accessToken) {
        // Save token to cookies
        Cookies.set("accessToken", data.data.accessToken, { expires: 7 }); // 7 days
        if (data.data.refreshToken) {
          Cookies.set("refreshToken", data.data.refreshToken, { expires: 30 }); // 30 days
        }
        
        toast.success(data.message || "Logged in successfully!");
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Login error", error);
      const message = error.response?.data?.message || "Failed to login. Please check your credentials.";
      toast.error(message);
    }
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export const removeAuthTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken");
  Cookies.remove("refreshToken", { path: "/" });

  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
  }
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<LoginResponse>("/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.accessToken) {
        Cookies.set("accessToken", data.data.accessToken, { expires: 7 });
        if (data.data.refreshToken) {
          Cookies.set("refreshToken", data.data.refreshToken, { expires: 30 });
        }

        toast.success(data.message || "Logged in successfully!");
        router.push("/dashboard");
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        "Failed to login. Please check your network connection or credentials.";
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } catch {
      // ignore
    } finally {
      removeAuthTokens();
      queryClient.clear();
      toast.success("Logged out successfully");
      window.location.href = "/auth/login";
    }
  };

  return { logout };
};


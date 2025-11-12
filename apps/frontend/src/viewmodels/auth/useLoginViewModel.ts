import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/loginService";
import type { LoginDto } from "../../models/login";

export const useLoginViewModel = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ email?: string; password?: string; general?: string }>({});


  const handleLogin = async () => {
    setLoading(true);
    setError({});

    const payload: LoginDto = { email, password };
    
    try {
      const response = await loginUser(payload);
      if (!response.token || typeof response.token.accessToken !== "string") {
        alert("Invalid token from server");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", response.token.accessToken);
      // Store user info for RBAC
      if (response.token.user) {
        localStorage.setItem("user", JSON.stringify(response.token.user));
      }
      navigate("/");
    } catch (e: any) {
      if (e.errors) {
        setError({
          email: e.errors.email,
          password: e.errors.password,
          general: e.errors.general,
        });
      } else {
        setError({ general: e.message || "Login failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  };
};
export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthActionResult {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
  resetUrl?: string;
  previewUrl?: string;
  email?: string;
  details?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

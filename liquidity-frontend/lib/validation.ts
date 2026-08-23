import { z } from "zod";

// Very basic rules for the login form.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["agent", "coordinator", "admin"]),
});

// Very basic rules for the registration form.
export const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  role: z.enum(["agent", "coordinator"]),
  areaId: z.string().min(1, "Please pick an area"),
});

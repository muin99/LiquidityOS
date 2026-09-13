import { z } from "zod";

// Very basic rules for the login form. "login" can be an email or a
// phone number, the backend figures out which one it is.
export const loginSchema = z.object({
  login: z.string().min(1, "Please enter your email or phone"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Very basic rules for the registration form. We only check the
// simple stuff here (is it filled in, is the email shaped like an
// email). The "you need an area OR a provider depending on your
// role" rule is checked separately in the page itself, with a plain
// if statement, because that's easier to follow than a fancy zod rule.
export const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  role: z.enum(["agent", "coordinator", "provider"]),
});

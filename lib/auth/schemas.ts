import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters.").max(128),
    newPassword: z.string().min(8, "New password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword === value.currentPassword) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Choose a password different from your current password." });
    }
    if (value.confirmPassword !== value.newPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
    }
  });

export type SignupValues = z.infer<typeof signupSchema>;

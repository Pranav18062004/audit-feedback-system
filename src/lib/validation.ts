import { z } from "zod";

export const emailLoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  redirectTo: z.string().optional(),
});

export const dashboardLoginSchema = z.object({
  passcode: z.string().min(8, "Passcode must be at least 8 characters."),
  redirectTo: z.string().optional(),
});

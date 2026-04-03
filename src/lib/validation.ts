import { z } from "zod";

export const dashboardLoginSchema = z.object({
  passcode: z.string().min(8, "Passcode must be at least 8 characters."),
  redirectTo: z.string().optional(),
});

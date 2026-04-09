import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import { Suspense } from "react";
import { HeaderActions } from "@/components/header-actions";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentUserAccess } from "@/lib/access";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Audit Feedback System",
    template: "%s | Audit Feedback System",
  },
  description:
    "Mobile-first audit feedback and store analytics powered by Next.js and Supabase.",
  applicationName: "Audit Feedback System",
  keywords: [
    "audit",
    "feedback",
    "supabase",
    "next.js",
    "analytics",
    "pwa",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await getCurrentUserAccess();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-card-border bg-card">
              <div className="page-shell flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src="/millenium-logo.png"
                    alt="Millenium Audit logo"
                    width={54}
                    height={28}
                    className="h-9 w-auto shrink-0 sm:h-10"
                    priority
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground sm:text-base">
                      Audit Feedback System
                    </span>
                    <span className="text-xs text-muted sm:text-sm">Millenium Audit</span>
                  </div>
                </div>
                <HeaderActions
                  isSignedIn={access.isAllowed}
                  isAdmin={access.isAdmin}
                  email={access.allowedUser?.email ?? access.email}
                />
              </div>
            </header>
            <div className="page-shell flex flex-1 flex-col px-4 py-6">
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
          </div>
          <Suspense>
            <RegisterServiceWorker />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

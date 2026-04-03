import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
    "Mobile-first anonymous audit feedback and store analytics powered by Next.js and Supabase.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <div className="relative flex min-h-screen flex-col">
            <div className="page-shell relative z-10 flex flex-1 flex-col px-2 py-4 sm:px-4 sm:py-6">
              <header className="mb-6 flex items-center justify-between gap-4 rounded-full border border-card-border/80 bg-card/80 px-4 py-3 backdrop-blur sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    Millenium Audit
                  </p>
                  <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                    Audit Feedback System
                  </h1>
                </div>
                <ThemeToggle />
              </header>
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

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { HistorySidebar } from "@/components/HistorySidebar";
import { AuthGate } from "@/components/AuthGate";
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
  title: "The Council — Ethical Deliberation",
  description:
    "Five AI philosophers deliberate on your ethical dilemmas through multi-round debate.",
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
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">
        <AuthGate>
          <TooltipProvider>
            <SidebarProvider defaultOpen={false}>
              <HistorySidebar />
              <SidebarInset>
                <header className="flex h-10 items-center px-2">
                  <SidebarTrigger className="text-white/40 hover:text-white/70" />
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </AuthGate>
      </body>
    </html>
  );
}

import { Nav } from "@/components/nav";
import "./globals.css";
import  localFont from "next/font/local";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";


const Inter = localFont({
  src: "../fonts/Inter.var.woff2",
  display: "swap",
  variable: "--font-inter",
})
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(" overflow-y-scroll", Inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

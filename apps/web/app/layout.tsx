import { Sora } from "next/font/google";
import { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { QueryClient,QueryClientProvider, } from "@tanstack/react-query";
import QueryProvider from "@/providers/QueryProvider";
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Render Lite",
  description: "Deploy anything, instantly.",
};
type Props={
  children:ReactNode
}
const queryClient = new QueryClient()

export default function RootLayout({ children }:Props) {
  
  return (
    <html lang="en" className={sora.variable}>
      <body className={`${sora.className} antialiased`}>

        <QueryProvider>
                {children}
        </QueryProvider>
        
        
        </body>
    </html>
  );
}
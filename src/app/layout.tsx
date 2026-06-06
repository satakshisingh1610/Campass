import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Campass — Find Your Perfect College",
  description:
    "Discover, compare, and decide on the best Indian colleges with real data on fees, placements, ratings and more.",
  keywords: ["college search", "India college ranking", "JEE colleges", "NEET colleges", "NIT IIT admission"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

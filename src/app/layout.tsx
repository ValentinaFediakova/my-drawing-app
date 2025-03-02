import type { Metadata } from "next";
import '../styles/base.scss'

export const metadata: Metadata = {
  title: "canvas drawing",
  description: "canvas drawing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

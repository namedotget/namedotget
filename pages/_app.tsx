import { Layout } from "@/components/layout/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { JetBrains_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import chalk from "chalk";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

console.log(chalk.green(">>x----------------->"));
console.log(chalk.green("      name.get™       "));
console.log(chalk.green(">>x----------------->"));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${jetbrainsMono.variable} font-mono`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </main>
  );
}

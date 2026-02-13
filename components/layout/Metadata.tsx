import Head from "next/head";

export function Metadata() {
  return (
    <Head>
      <title key="meta-title">name.get™</title>
      <link rel="icon" href="/namedotget-icon.png" />
      <link rel="apple-touch-icon" href="/namedotget-icon.png" />
      <meta name="theme-color" content="#50c878" />
      <meta name="description" content="a digital creator" />
      <meta
        name="keywords"
        content="name.get™, namedotget, digital creator, web development, web3, react, nextjs, tailwindcss, threejs"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@namedotget" />
      <meta name="twitter:creator" content="@namedotget" />
      <meta name="twitter:title" content="name.get™" />
      <meta name="twitter:description" content="a digital creator" />
      <meta name="twitter:image" content="/namedotget-icon.png" />
      <meta property="og:title" content="name.get™" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://namedotget.com" />
      <meta property="og:image" content="/namedotget-icon.png" />
      <meta property="og:description" content="a digital creator" />
      <meta property="og:site_name" content="namedotget" />
    </Head>
  );
}

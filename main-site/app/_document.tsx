// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* FAVICON — since you already have favicon.ico in /pages, this works automatically */}
          <link rel="icon" href="/favicon.ico" />
          {/* Optional: if you have PNG/SVG versions, add them here too */}
          {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
          
          {/* DEFAULT BROWSER TAB TITLE — shown if page doesn’t override it */}
          <title>Mike Gold — Engineer</title>

          {/* Optional: other global meta tags */}
          <meta name="description" content="iD Hat registry, Gravity Core polygon system & profile tools v3.0" />
          <meta charSet="utf-8" />
        </Head>
        <body>
          <Main /> {/* this is where your page content goes */}
          <NextScript /> {/* required for Next.js scripts */}
        </body>
      </Html>
    )
  }
}
import { Html, Head, Main, NextScript } from "next/document";
import { i18nConfig } from "../../i18n";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function Document(props: any) {
  const currentLocale =
    props.__NEXT_DATA__.query.locale ?? i18nConfig.defaultLocale;

  return (
    <Html lang={currentLocale}>
      <Head>
        <link rel="icon" type="image/svg+xml" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/icon.svg`} />
        { process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

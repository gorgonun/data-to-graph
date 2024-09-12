import { Html, Head, Main, NextScript } from "next/document";
import { i18nConfig } from "../../i18n";

export default function Document(props: any) {
  const currentLocale =
    props.__NEXT_DATA__.query.locale ?? i18nConfig.defaultLocale;

  return (
    <Html lang={currentLocale}>
      <Head>
        <link rel="icon" type="image/svg+xml" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/icon.svg`} />
        <meta name="google-site-verification" content="JU7c8voS3f2z60mQQBBjoyHgR2Vw4B5FDYxuTKDZm0c" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

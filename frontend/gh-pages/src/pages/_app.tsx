import PageLayout from "@/components/PageLayout";
import { RootProvider } from "@/Providers/RootProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "@/Providers/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <LanguageProvider>
      <RootProvider>
        <PageLayout>
          <Component {...pageProps} />
          { process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </PageLayout>
      </RootProvider>
    </LanguageProvider>
  );
};

export default App;

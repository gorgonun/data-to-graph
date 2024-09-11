import PageLayout from "@/components/PageLayout";
import { RootProvider } from "@/Providers/RootProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LanguageProvider } from "@/Providers/LanguageContext";

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

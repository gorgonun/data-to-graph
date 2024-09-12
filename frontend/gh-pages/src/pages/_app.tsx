import PageLayout from "@/components/PageLayout";
import { RootProvider } from "@/Providers/RootProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "@/Providers/LanguageContext";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <LanguageProvider>
      <RootProvider>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </RootProvider>
    </LanguageProvider>
  );
};

export default App;

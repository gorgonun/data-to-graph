import PageLayout from "@/components/PageLayout";
import { RootProvider } from "@/Providers/RootProvider";
import type { AppProps } from "next/app";
import LanguageProvider from "@/Providers/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import CssBaseline from '@mui/material/CssBaseline';
import { AlertProvider } from "@/Providers/AlertContext";
import dynamic from "next/dynamic";

const App = ({ Component, pageProps }: AppProps) => {

  return (
    <AlertProvider>
      <LanguageProvider>
        <RootProvider>
          <PageLayout>
          <CssBaseline />
            <Component {...pageProps} />
            {process.env.NEXT_PUBLIC_GA_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
          </PageLayout>
        </RootProvider>
      </LanguageProvider>
    </AlertProvider>
  );
};

export default App;

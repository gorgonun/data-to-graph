import PageLayout from "@/components/PageLayout";
import { MainPage } from "@/components/MainPage";
import { LanguageProvider } from "@/Providers/LanguageContext";

const Home = () => {

  return (
    <LanguageProvider>
      <PageLayout>
        <MainPage />
      </PageLayout>
    </LanguageProvider>
  );
};

export default Home;

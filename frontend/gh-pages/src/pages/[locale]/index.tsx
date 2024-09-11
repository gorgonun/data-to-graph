import { MainPage } from "@/components/MainPage";
import Head from 'next/head'

const Home = () => {
  return (
    <>
      <Head>
        <title>Data2Graph</title>
        <meta name='description' content='Check out all essential information about data2graph' />
      </Head>
      <MainPage />
    </>
  );
};

export default Home;

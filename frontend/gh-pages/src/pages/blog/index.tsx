import RootBlogPage from "@/components/RootBlogPage";
import { BlogFontmatter, getBlogPostDataDateSorted } from "@/libs/content";

interface Props {
  sortedPostData: ({
    id: string;
    filename: string;
  } & BlogFontmatter)[];
}

export async function getStaticProps() {
  const sortedPostData = await getBlogPostDataDateSorted();

  return {
    props: {
      sortedPostData,
    },
  };
}

export default function Home({ sortedPostData }: Props) {
  return <RootBlogPage sortedPostData={sortedPostData} />;
}

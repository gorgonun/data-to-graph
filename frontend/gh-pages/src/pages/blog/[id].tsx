import { GetStaticPropsContext } from "next";
import { lazy, Suspense } from "react";
import { BlogFontmatter, getAllBlogPostIds, getBlogPostData } from "@/libs/content";
import BlogPage from "@/components/BlogPage";

interface Props {
  postData: {
    id: string;
    filename: string;
  } & BlogFontmatter;
}

export async function getStaticPaths() {
  const paths = await getAllBlogPostIds();

  return {
    paths: paths.map((id) => ({
      params: {
        id,
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  if (typeof params?.id !== "string") {
    throw new Error("Invalid post id");
  }

  const postData = getBlogPostData(params?.id);

  return {
    props: {
      postData,
    },
  };
}

const Documentation = ({ postData }: Props) => {
  const Mdx = lazy(
    () => import(`@/content/blog/${postData.filename}`)
  );

  return (
    <Suspense key={postData.id}>
      <BlogPage title={postData.title} subtitle={postData.subtitle}>
        <Mdx />
      </BlogPage>
    </Suspense>
  );
};

export default Documentation;

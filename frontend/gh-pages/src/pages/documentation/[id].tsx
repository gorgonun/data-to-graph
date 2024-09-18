import { getAllPostIds, getPostData } from "@/libs/content";
import { GetStaticPropsContext } from "next";
import DocumentationPage from "@/components/DocumentationPage";
import { lazy, Suspense } from "react";
import dynamic from "next/dynamic";

interface Props {
  postData: {
    id: string;
    filename: string;
    order: number;
  };
  pages: string[];
}

export async function getStaticPaths() {
  const paths = await getAllPostIds();

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

  const postData = getPostData(params?.id);
  const pages = (await getAllPostIds())
    .map((id) => getPostData(id))
    .sort((a, b) => a.order - b.order)
    .map((p) => p.id);

  return {
    props: {
      postData,
      pages,
    },
  };
}

const Documentation = ({ postData, pages }: Props) => {
  const Mdx = lazy(
    () => import(`@/content/documentation/${postData.filename}`)
  );

  return (
    <Suspense key={postData.id}>
      <DocumentationPage pages={pages} currentPageId={postData.id}>
        <Mdx />
      </DocumentationPage>
    </Suspense>
  );
};

export default Documentation;

import {
  DocumentationFontmatter,
  getAllDocumentationPostIds,
  getDocumentationPostData,
} from "@/libs/content";
import { GetStaticPropsContext } from "next";
import DocumentationPage from "@/components/DocumentationPage";
import { lazy, Suspense } from "react";

interface Props {
  postData: {
    id: string;
    filename: string;
  } & DocumentationFontmatter;
  pages: string[];
}

export async function getStaticPaths() {
  const paths = await getAllDocumentationPostIds();

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

  const postData = getDocumentationPostData(params?.id);
  const pages = (await getAllDocumentationPostIds())
    .map((id) => getDocumentationPostData(id))
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

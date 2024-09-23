import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { readdir } from "node:fs/promises";

export type BlogFontmatter = {
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  contextPath: string;
};

export type DocumentationFontmatter = {
  order: number;
};

const DOCUMENTATION_DIRECTORY = path.join(
  process.cwd(),
  "src/content/documentation"
);

const BLOG_DIRECTORY = path.join(process.cwd(), "src/content/blog");

async function getAllFiles(directory: string, extension: string) {
  try {
    const files = await readdir(directory, { recursive: true });
    return files.filter((file) => file.endsWith(extension));
  } catch (err) {
    return [];
  }
}

async function getAllMdxIds(dir: string) {
  return (await getAllFiles(dir, ".mdx")).map((fileName) => {
    const newName = fileName.replace(/\.mdx$/, "");
    if (newName.endsWith("/index")) {
      return newName.replace(/\/index$/, "");
    }
    return newName;
  });
}

function getMdxData<T>(dir: string, id: string) {
  const filenamesToCheck = [`${id}.mdx`, `${id}/index.mdx`];
  const fileContents = (() => {
    for (const filename of filenamesToCheck) {
      const fullPath = path.join(dir, filename);
      if (fs.existsSync(fullPath)) {
        return { filename, buffer: fs.readFileSync(fullPath) };
      }
    }

    return null;
  })();

  if (!fileContents) {
    throw new Error(`No such file: ${id}`);
  }

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents.buffer);

  // Combine the data with the id
  return {
    id,
    filename: fileContents.filename,
    ...(matterResult.data as T),
  };
}

export function getAllDocumentationPostIds() {
  return getAllMdxIds(DOCUMENTATION_DIRECTORY);
}

export function getDocumentationPostData(id: string) {
  return getMdxData<DocumentationFontmatter>(DOCUMENTATION_DIRECTORY, id);
}

export function getAllBlogPostIds() {
  return getAllMdxIds(BLOG_DIRECTORY);
}

export function getBlogPostData(id: string) {
  const mdxData = getMdxData<Omit<BlogFontmatter, "contextPath">>(
    BLOG_DIRECTORY,
    id
  );
  const contextPath =
    BLOG_DIRECTORY + "/" + mdxData.filename.endsWith("/index.mdx")
      ? mdxData.filename.replace(/\/index.mdx$/, "")
      : mdxData.filename.split("/").slice(0, -1).join("/");

  return {
    ...mdxData,
    contextPath,
  };
}

export async function getBlogPostDataByTag(tag: string) {
  return (await getAllBlogPostIds())
    .map((id) => getBlogPostData(id))
    .filter((post) => post.tags.includes(tag));
}

export async function getBlogPostDataDateSorted() {
  return (await getAllBlogPostIds())
    .map((id) => getBlogPostData(id))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// export async function getSortedPostsData() {
//   // Get file names under /posts
//   const fileNames = await getAllRecursiveFiles(documentationDirectory);
//   const allPostsData = fileNames.map((fileName) => {
//     // Remove ".md" from file name to get id
//     const id = fileName.replace(/\.mdx$/, "");

//     // Read markdown file as string
//     const fullPath = path.join(documentationDirectory, fileName);
//     const fileContents = fs.readFileSync(fullPath, "utf8");

//     // Use gray-matter to parse the post metadata section
//     const matterResult = matter(fileContents);

//     // Combine the data with the id
//     return {
//       id,
//       ...matterResult.data,
//     };
//   });
//   // Sort posts by date
//   return allPostsData.sort((a, b) => {
//     if (a.date < b.date) {
//       return 1;
//     } else {
//       return -1;
//     }
//   });
// }

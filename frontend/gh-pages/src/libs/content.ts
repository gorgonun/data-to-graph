import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { readdir } from "node:fs/promises";

export async function getAllRecursiveFiles(directory: string) {
  try {
    const files = await readdir(directory, { recursive: true });
    return files;
  } catch (err) {
    return [];
  }
}

const documentationDirectory = path.join(
  process.cwd(),
  "src/content/documentation"
);

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

export async function getAllPostIds() {
  return (await getAllRecursiveFiles(documentationDirectory)).map((fileName) =>
    fileName.replace(/\.mdx$/, "")
  );
}

export function getPostData(id: string) {
  const filename = `${id}.mdx`;
  const fullPath = path.join(documentationDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Combine the data with the id
  return {
    id,
    filename,
    ...matterResult.data  as { order: number },
  };
}

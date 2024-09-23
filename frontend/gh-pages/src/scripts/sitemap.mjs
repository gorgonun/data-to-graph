import fs from "fs";
import path from "path";
import { readdir } from "node:fs/promises";
import matter from "gray-matter";

const DOCUMENTATION_DIRECTORY = path.join(
  process.cwd(),
  "src/content/documentation"
);

const BLOG_DIRECTORY = path.join(process.cwd(), "src/content/blog");

async function getAllFiles(directory, extension) {
  const files = await readdir(directory, { recursive: true });
  return files.filter((file) => file.endsWith(extension));
}

async function getAllMdxIds(dir) {
  return (await getAllFiles(dir, ".mdx")).map((fileName) => {
    const newName = fileName.replace(/\.mdx$/, "");
    if (newName.endsWith("/index")) {
      return newName.replace(/\/index$/, "");
    }
    return newName;
  });
}

function getMdxData(dir, id) {
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
    ...matterResult.data,
  };
}

export function getAllDocumentationPostIds() {
  return getAllMdxIds(DOCUMENTATION_DIRECTORY);
}

export function getDocumentationPostData(id) {
  return getMdxData(DOCUMENTATION_DIRECTORY, id);
}

export function getAllBlogPostIds() {
  return getAllMdxIds(BLOG_DIRECTORY);
}

export function getBlogPostData(id) {
  const mdxData = getMdxData(BLOG_DIRECTORY, id);
  const contextPath =
    BLOG_DIRECTORY + "/" + mdxData.filename.endsWith("/index.mdx")
      ? mdxData.filename.replace(/\/index.mdx$/, "")
      : mdxData.filename.split("/").slice(0, -1).join("/");

  return {
    ...mdxData,
    contextPath,
  };
}

async function generateSitemap() {
  const host = process.env.HOST ?? "localhost:3000";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = `https://${host}${basePath}`;

  const allPosts = await getAllBlogPostIds();
  const postData = allPosts.map((id) => getBlogPostData(id));

  const allDocumentation = await getAllDocumentationPostIds();
  const documentationData = allDocumentation.map((id) =>
    getDocumentationPostData(id)
  );
  const maxBlogDate = postData.reduce((max, post) => {
    return Math.max(max, new Date(post.date));
  }, new Date(0));

  const urls = [
    {
      url: url,
      lastModified: new Date(),
    },
    {
      url: `${url}/blog`,
      lastModified: new Date(maxBlogDate),
    },
    ...postData.map((post) => ({
      url: `${url}/blog/${post.id}`,
      lastModified: new Date(post.date),
    })),
    ...documentationData.map((post) => ({
      url: `${url}/documentation/${post.id}`,
      lastModified: new Date(post.date),
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${urls.map((url) => {
              return `
                <url>
                  <loc>${url.url}</loc>
                  ${
                    url.lastModified
                      ? `<lastmod>${url.lastModified.toISOString()}</lastmod>`
                      : ""
                  }
                </url>
              `;
            }).join("")}
            </urlset>
          `;

  return sitemap;
}

async function writeSitemap() {
  const sitemap = await generateSitemap();
  fs.writeFileSync("public/sitemap.xml", sitemap);
}

writeSitemap();

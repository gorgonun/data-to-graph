import { BlogFontmatter } from "@/libs/content";
import { Card, CardActionArea, CardMedia, Stack } from "@mui/material";

interface Props {
  sortedPostData: ({
    id: string;
    filename: string;
  } & BlogFontmatter)[];
}

export default function RootBlogPage({ sortedPostData }: Props) {
  return (
    <Stack>
      {sortedPostData.map((post) => {
        return (
          <Card key={post.id}>
            <CardActionArea>
              <CardMedia
                component="img"
                image={`blog/${post.contextPath}/${post.coverImage}`}
                alt={post.coverImageAlt}
              />
            </CardActionArea>
          </Card>
        );
      })}
      <Card>
        <CardActionArea>
          <CardMedia
            component="img"
            image={sortedPostData[0].coverImage}
            alt={sortedPostData[0].coverImageAlt}
          />
        </CardActionArea>
      </Card>
    </Stack>
  );
}

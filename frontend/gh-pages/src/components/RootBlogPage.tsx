import { BlogFontmatter } from "@/libs/content";
import {
  Card,
  CardActionArea,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

interface Props {
  sortedPostData: ({
    id: string;
    filename: string;
  } & BlogFontmatter)[];
}

export default function RootBlogPage({ sortedPostData }: Props) {
  return (
    <Stack sx={{ width: "100%", maxWidth: "lg", mx: "auto" }}>
      <Stack mt={2}>
        {sortedPostData.map((post) => {
          const T = require(`@/content/blog/${post.contextPath}/${post.coverImage}`);

          return (
            <Stack key={post.id} p={2} width="30vw" height='50vh'>
              <Card>
                <CardActionArea component={Link} href={`/blog/${post.id}`}>
                  <Stack alignItems='center' p={2}>
                    <Stack>
                      <Image
                        src={T}
                        alt={post.coverImageAlt}
                        style={{
                          width: 'auto',
                          maxHeight: '30vh'
                        }}
                      />
                    </Stack>
                    <Stack mt={1}>
                      <Typography fontWeight={700} fontSize='1em'>{post.title}</Typography>
                      <Typography fontSize='0.8em' color='gray'>{post.subtitle}</Typography>
                    </Stack>
                  </Stack>
                </CardActionArea>
              </Card>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

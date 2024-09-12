import { useI18n } from "@/hooks/useI18n";
import { Stack, Typography, Button } from "@mui/material";
import Link from "next/link";

const Custom404 = () => {
  const { t } = useI18n({ namespace: "common" });
  
  return (
    <Stack mt={10} width="100%" maxWidth="lg" mx="auto">
      <Typography variant="h3">404 - {t('notFound')}</Typography>
      <Link href="/">
        <Button>{t('goToHome')}</Button>
      </Link>
    </Stack>
  );
};

export default Custom404;

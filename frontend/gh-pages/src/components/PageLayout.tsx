import { Stack, Box } from "@mui/material";
import { ReactNode, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { D2GAppBar } from "./appbar/AppBar";
import { useRouter } from "next/router";
import { Alert, useAlert } from "@/Providers/AlertContext";
import { AlertBanner } from "./AlertBanner";
import { useLanguage } from "@/Providers/LanguageContext";

type Props = {
  children?: ReactNode;
  locale?: string;
};

export default function PageLayout({ children }: Props) {
  const router = useRouter();
  const [useDocumentationLayout, setUseDocumentationLayout] = useState(false);
  const { alertQueue, popAllAlerts } = useAlert();
  const [pageAlerts, setPageAlerts] = useState<Alert[]>([]);
  const { languageContextIsReady } = useLanguage();
  /**
   * State to track if the page is ready. It will only be ready when we set the useDocumentationLayout state.
   */
  const [pageIsReady, setPageIsReady] = useState(false);
  const canRenderPage = useMemo(() => languageContextIsReady && pageIsReady, [languageContextIsReady, pageIsReady]);

  useLayoutEffect(() => {
    setUseDocumentationLayout(
      router.pathname.match(/\/documentation(\/)?/) !== null
    );
    setPageAlerts([]);
    setPageIsReady(true);
  }, [router.pathname]);

  useEffect(() => {
    if (alertQueue.length > 0) {
      setPageAlerts(popAllAlerts());
    }
  }, [alertQueue, popAllAlerts]);

  const removeAlertByIndex = (index: number) => {
    setPageAlerts((prevAlerts) => {
      const newAlerts = [...prevAlerts];
      newAlerts.splice(index, 1);
      return newAlerts;
    });
  }

  return (
    canRenderPage && (
      <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
        <Stack>
          <D2GAppBar />
        </Stack>
        {pageAlerts.map((alert, index) => (
          <AlertBanner key={index} alert={alert} onClose={() => removeAlertByIndex(index)} />
        ))}
        <Box
          sx={{
            ...(useDocumentationLayout
              ? { width: "100%", maxWidth: "md", mx: "auto", marginTop: 2, p: 2 }
              : {}),
          }}
        >
          {children}
        </Box>
      </Stack>
    )
  );
}

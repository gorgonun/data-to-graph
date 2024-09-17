import { Stack, Box } from "@mui/material";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { D2GAppBar } from "./appbar/AppBar";
import { Alert, useAlert } from "@/Providers/AlertContext";
import { AlertBanner } from "./AlertBanner";
import { useLanguage } from "@/Providers/LanguageContext";
import { useRouter } from "next/router";

type Props = {
  children?: ReactNode;
  locale?: string;
};

export default function PageLayout({ children }: Props) {
  const router = useRouter();
  const { alertQueue, popAllAlerts } = useAlert();
  const [pageAlerts, setPageAlerts] = useState<Alert[]>([]);
  const { languageContextIsReady } = useLanguage();

  useEffect(() => {
    setPageAlerts([]);
  }, [router])

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
  };

  return (
    languageContextIsReady && (
      <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
        <Stack>
          <D2GAppBar />
        </Stack>
        {pageAlerts.map((alert, index) => (
          <AlertBanner
            key={index}
            alert={alert}
            onClose={() => removeAlertByIndex(index)}
          />
        ))}
        <Box>{children}</Box>
      </Stack>
    )
  );
}

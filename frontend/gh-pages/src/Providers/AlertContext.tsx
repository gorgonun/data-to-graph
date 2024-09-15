import React from "react";

export type Alert = {
  message: string;
  severity: "error" | "warning" | "info";
};

export type AlertContextType = {
  alertQueue: Alert[];
  pushAlert: (alert: Alert) => void;
  popAlert: () => Alert | undefined;
  popAllAlerts: () => Alert[];
};

export const AlertContext = React.createContext<AlertContextType>({
  alertQueue: [],
  pushAlert: () => {},
  popAlert: () => undefined,
  popAllAlerts: () => [],
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertQueue, setAlertQueue] = React.useState<
    {
      message: string;
      severity: "error" | "warning" | "info";
    }[]
  >([]);

  const pushAlert = (alert: Alert) => {
    setAlertQueue((prevQueue) => [...prevQueue, alert]);
  };

  const popAlert = () => {
    if (alertQueue.length === 0) {
      return undefined;
    }

    const [alert, ...rest] = alertQueue;
    setAlertQueue(rest);
    return alert;
  };

  const popAllAlerts = () => {
    const alerts = alertQueue;
    setAlertQueue([]);
    return alerts;
  }

  return (
    <AlertContext.Provider value={{ alertQueue, pushAlert, popAlert, popAllAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export function useAlert() {
  return React.useContext(AlertContext);
}

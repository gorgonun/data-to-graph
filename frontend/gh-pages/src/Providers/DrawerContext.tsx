import React from "react";

interface DrawerItem {
    label: string;
    href: string;
}

export type DrawerContextType = {
    extraItems: DrawerItem[];
    setExtraItems: (items: DrawerItem[]) => void;
};

export const DrawerContext = React.createContext<DrawerContextType>({
    extraItems: [],
    setExtraItems: () => {},
});

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [extraItems, setExtraItems] = React.useState<DrawerItem[]>([]);

  return (
    <DrawerContext.Provider value={{ extraItems, setExtraItems }}>
      {children}
    </DrawerContext.Provider>
  );
};

export function useDrawer() {
  return React.useContext(DrawerContext);
}

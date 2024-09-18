import { useEffect, useState } from "react";

export const useVisibleSections = (sectionIds: string[]) => {
  const [visibleSection, setVisibleSection] = useState<string[]>([]);

  useEffect(() => {
    const handleObserver: IntersectionObserverCallback = (entries) => {
      const newVisibleSections: string[] = [];

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          newVisibleSections.push(entry.target.id);
        }
      });
      setVisibleSection(newVisibleSections);
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 1, // 10% visível
    });

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sectionIds]);

  return visibleSection;
};

import { NextRouter } from "next/router";

export const getHref = (locale: string, router: NextRouter) => {
  let pName = router.pathname;

  Object.keys(router.query).forEach((k) => {
    if (k === "locale") {
      pName = pName.replace(`[${k}]`, locale);
      return;
    }

    pName = pName.replace(`[${k}]`, String(router.query[k]));
  });

  return pName;
};

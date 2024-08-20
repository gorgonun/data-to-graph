/// <reference types="vite-plugin-svgr/client" />
import { SvgIcon, SvgIconProps } from "@mui/material";
import LogoD2G from "./d2g-icon.svg?react";

export const IconD2G = (props: SvgIconProps) => (
  <SvgIcon {...props} component={LogoD2G} inheritViewBox />
);

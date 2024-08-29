'use client';
import { createTheme } from "@mui/material/styles";
import { Oxygen_Mono } from 'next/font/google';

const oxygenMono = Oxygen_Mono({ subsets: ['latin'], weight: '400' });

const theme = createTheme({
  palette: {
    primary: {
      main: "#549d8a",
      light: "#7fb9a5",
      dark: "#3c6b5f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8a549d",
      light: "#a57fb9",
      dark: "#5f3c6b",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#ffffff",
    },
  },
  typography: {
    h1: {
      fontFamily: oxygenMono.style.fontFamily,
    },
    h2: {
      fontFamily: oxygenMono.style.fontFamily,
    },
    h3: {
      fontFamily: oxygenMono.style.fontFamily,
    },
  }
});

export default theme;

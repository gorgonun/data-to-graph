import { PaletteMode, ThemeOptions } from "@mui/material";

const theme = {
  primary: {
    main: '#549d8a',
    light: '#7fb9a5',
    dark: '#3c6b5f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#cddc39',
    light: '#d4e157',
    dark: '#afb42b',
    contrastText: '#000000',
  },
  background: {
    light: '#ffffff',
    dark: '#121212',
  },
  text: {
    primary: '#000000',
    secondary: '#ffffff',
  },
  typography: {
    allVariants: {
      fontFamily: [
        'Oxigen Mono'
      ].join(','),
    }
  }
} as ThemeOptions;

export const getDesignTheme = (mode: PaletteMode) =>
  ({
    palette: {
      mode,
      theme,
    },
  } as ThemeOptions);

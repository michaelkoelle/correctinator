import { createMuiTheme } from '@material-ui/core';
import { shouldUseDarkColors, Theme, themeToPaletteType } from './model/Theme';

const createTheme = (appTheme: Theme) =>
  createMuiTheme({
    palette: {
      type: themeToPaletteType(appTheme),
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          '*::-webkit-scrollbar': {
            width: '0.5em',
            height: '0.5em',
          },
          '*::-webkit-scrollbar-track': {
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: shouldUseDarkColors(appTheme)
              ? 'rgba(255,255,255,.2)'
              : 'rgba(0,0,0,.2)',
            outline: '1px solid slategrey',
            borderRadius: '5px',
          },
          '*::-webkit-scrollbar-corner': {
            opacity: 0,
          },
        },
      },
    },
  });

export default createTheme;

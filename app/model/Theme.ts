import { PaletteType } from '@material-ui/core';
import { remote } from 'electron';

export enum Theme {
  DARK,
  LIGHT,
  SYSTEM,
}

export const themeToPaletteType = (theme: Theme): PaletteType => {
  switch (theme) {
    case Theme.DARK:
      return 'dark';
    case Theme.LIGHT:
      return 'light';
    default:
      return remote.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
};

export const shouldUseDarkColors = (theme: Theme): boolean => {
  switch (theme) {
    case Theme.DARK:
      return true;
    case Theme.LIGHT:
      return false;
    default:
      return remote.nativeTheme.shouldUseDarkColors;
  }
};

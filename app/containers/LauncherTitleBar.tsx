/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FramelessTitlebar from 'frameless-titlebar';
import 'setimmediate';
import * as Path from 'path';
import { useSelector } from 'react-redux';
import { useTheme } from '@material-ui/core';
import { remote } from 'electron';
import { version } from '../package.json';
import { selectSettings, SettingsState } from '../model/SettingsSlice';
import { shouldUseDarkColors } from '../model/Theme';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';

const currentWindow = remote.getCurrentWindow();

export default function LauncherTitleBar() {
  const theme = useTheme();
  const settings: SettingsState = useSelector(selectSettings);
  const workspace: string = useSelector(selectWorkspacePath);
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());

  // add window listeners for currentWindow
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  // used by double click on the titlebar
  // and by the maximize control button
  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        // zIndex: 9999,
        zIndex: 200,
      }}
    >
      <div
        style={{
          position: 'fixed',
          left: '200px',
          width: 'calc(100% - 200px)',
          height: '28px',
          boxShadow: '2px 0px 5px 0px rgba(0,0,0,0.2)',
          zIndex: -9999,
        }}
      />
      <FramelessTitlebar
        // iconSrc="../resources/titlebar.png" // app icon
        currentWindow={currentWindow} // electron window instance
        // platform={process.platform} // win32, darwin, linux
        menu={[{ type: 'submenu', label: '', disabled: true }]}
        theme={{
          bar: {
            color: theme.palette.text.primary,
            background: theme.palette.background.paper,
            borderBottom: 'none',
            icon: {
              width: 35,
              height: 35,
            },
          },
          ...theme,
          menu: {
            palette: shouldUseDarkColors(settings.general.theme)
              ? 'dark'
              : 'light',
            overlay: {
              opacity: 0.0,
            },
            separator: {
              color: theme.palette.divider,
            },
          },
        }}
        title={`${
          workspace.length > 0 ? `${Path.parse(workspace).name}` : 'Launcher'
        }`}
        onClose={() => {
          currentWindow.close();
        }}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={handleMaximize}
        // when the titlebar is double clicked
        onDoubleClick={handleMaximize}
        // hide minimize windows control
        disableMinimize={false}
        // hide maximize windows control
        disableMaximize={false}
        // is the current window maximized?
        maximized={maximized}
      />
    </div>
  );
}

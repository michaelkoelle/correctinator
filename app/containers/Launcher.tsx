import React from 'react';
import LauncherNavigation from '../components/LauncherNavigation';
import LauncherTitleBar from './LauncherTitleBar';

export default function Launcher() {
  return (
    <>
      <LauncherTitleBar />
      <LauncherNavigation />
    </>
  );
}

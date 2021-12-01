/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LauncherNavigation from '../components/LauncherNavigation';
import BackupEffect from '../effects/BackupEffect';
import CheckForUpdatesEffect from '../effects/CheckForUpdatesEffect';
import SaveBeforeQuittingEffect from '../effects/SaveBeforeQuittingEffect';
import WorkspaceEffect from '../effects/WorkspaceEffect';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import { useModal } from '../modals/ModalProvider';
import { selectUnsavedChanges } from '../model/SaveSlice';
import { selectSettingsBackup } from '../model/SettingsSlice';
import LauncherTitleBar from './LauncherTitleBar';

export default function Launcher() {
  const dispatch = useDispatch();
  const showModal = useModal();
  const unsavedChanges = useSelector(selectUnsavedChanges);
  const saveBackups = useSelector(selectSettingsBackup);
  const workspacePath = useSelector(selectWorkspacePath);
  const [quitAnyways, setQuitAnyways] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(CheckForUpdatesEffect(showModal), []);
  useEffect(WorkspaceEffect(dispatch, workspacePath), [
    dispatch,
    workspacePath,
  ]);
  useEffect(BackupEffect(workspacePath, saveBackups.enabled), [
    saveBackups,
    workspacePath,
  ]);
  useEffect(
    SaveBeforeQuittingEffect(
      quitAnyways,
      setQuitAnyways,
      reload,
      setReload,
      showModal,
      unsavedChanges
    ),
    [quitAnyways, setQuitAnyways, reload, setReload, showModal, unsavedChanges]
  );
  return (
    <>
      <LauncherTitleBar />
      <LauncherNavigation />
    </>
  );
}

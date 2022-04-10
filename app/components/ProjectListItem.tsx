import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core';
import fs from 'fs';
import React, { useState } from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import { useDispatch, useSelector } from 'react-redux';
import * as Path from 'path';
import { projectsRemoveOne } from '../slices/ProjectsSlice';
import { useModal } from '../modals/ModalProvider';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import Project from '../model/Project';
import { launcherSetTabIndex } from '../slices/LauncherSlice';
import LauncherTabs from '../model/LauncherTabs';
import {
  selectWorkspacePath,
  workspaceSetPath,
} from '../slices/WorkspaceSlice';
import UnsavedChangesDialog from '../dialogs/UnsavedChangesDialog';
import { reloadState } from '../utils/FileAccess';
import { selectUnsavedChanges } from '../slices/SaveSlice';

type ProjectListItemProps = {
  project: Project;
  setOpenFileError: (open: boolean) => void;
};

export default function ProjectListItem(props: ProjectListItemProps) {
  const { project, setOpenFileError } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const selectedFile = useSelector(selectWorkspacePath);
  const unsavedChanges = useSelector(selectUnsavedChanges);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const selected = selectedFile === project.path;

  const removeProjectFromList = () => {
    dispatch(projectsRemoveOne(project.id));
    if (selected) {
      dispatch(workspaceSetPath(''));
    }
    setAnchorEl(null);
  };

  const deleteProject = () => {
    showModal(ConfirmationDialog, {
      title: `Delete project "${project.name}"?`,
      onConfirm: () => {
        dispatch(projectsRemoveOne(project.id));
        if (fs.existsSync(project.path)) {
          if (selected) {
            dispatch(workspaceSetPath(''));
          }
          fs.unlinkSync(project.path);
        }
      },
    });
    setAnchorEl(null);
  };

  const loadNewFile = (path: string) => {
    if (Path.extname(path) === '.cor') {
      if (unsavedChanges) {
        showModal(ConfirmationDialog, UnsavedChangesDialog(path));
      } else {
        dispatch(workspaceSetPath(path));
        dispatch(reloadState());
      }
    }
  };

  const setSelectedFile = () => {
    if (
      !fs.existsSync(project.path) ||
      Path.parse(project.path).ext === 'cor'
    ) {
      removeProjectFromList();
      setOpenFileError(true);
      return;
    }

    loadNewFile(project.path);
  };

  const setSelectedFileAndSwitchToSheets = () => {
    setSelectedFile();
    dispatch(launcherSetTabIndex(LauncherTabs.SHEETS));
  };

  return (
    <>
      <ListItem
        onClick={() => setSelectedFileAndSwitchToSheets()}
        selected={selected}
        button
      >
        <ListItemText primary={project.name} secondary={project.path} />
        {selected && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <SettingsIcon style={{ fill: 'gray' }} />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => removeProjectFromList()}>
          Remove project from list
        </MenuItem>
        <MenuItem onClick={() => deleteProject()}>Delete project</MenuItem>
      </Menu>
    </>
  );
}

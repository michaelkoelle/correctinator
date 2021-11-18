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
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import * as Path from 'path';
import { projectsRemoveOne } from '../model/ProjectsSlice';
import { useModal } from '../modals/ModalProvider';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import Project from '../model/Project';
import { OPEN_MAIN_WINDOW } from '../constants/WindowIPC';

type ProjectListItemProps = {
  project: Project;
  setOpenFileError: (open: boolean) => void;
};

export default function ProjectListItem(props: ProjectListItemProps) {
  const { project, setOpenFileError } = props;
  const dispatch = useDispatch();
  const showModal = useModal();

  const [hover, setHover] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenProject = () => {
    if (
      !fs.existsSync(project.path) ||
      Path.parse(project.path).ext === 'cor'
    ) {
      dispatch(projectsRemoveOne(project.id));
      setOpenFileError(true);
      return;
    }

    ipcRenderer.send(OPEN_MAIN_WINDOW, project.path);
  };

  const removeProjectFromList = () => {
    dispatch(projectsRemoveOne(project.id));
    setAnchorEl(null);
  };

  const deleteProject = () => {
    showModal(ConfirmationDialog, {
      title: `Delete project "${project.name}"?`,
      onConfirm: () => {
        dispatch(projectsRemoveOne(project.id));
        if (fs.existsSync(project.path)) {
          fs.unlinkSync(project.path);
        }
      },
    });
    setAnchorEl(null);
  };

  return (
    <>
      <ListItem
        onMouseEnter={() => setHover(true)}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => handleOpenProject()}
        button
      >
        <ListItemText primary={project.name} secondary={project.path} />
        {hover && (
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

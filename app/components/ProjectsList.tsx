import { List, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState } from 'react';
import Project from '../model/Project';
import ProjectListItem from './ProjectListItem';

type ProjectsListProps = {
  projects: Project[];
};

export default function ProjectsList(props: ProjectsListProps) {
  const { projects } = props;
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [openFileError, setOpenFileError] = useState<boolean>(false);

  return (
    <>
      <List
        style={{
          flex: '1 1 0px',
          overflow: 'auto',
        }}
      >
        {projects.map((p) => (
          <ProjectListItem
            key={p.id}
            project={p}
            hover={p.id === hoverId}
            setHoverId={setHoverId}
            setOpenFileError={setOpenFileError}
          />
        ))}
      </List>
      <Snackbar
        open={openFileError}
        autoHideDuration={3000}
        onClose={() => setOpenFileError(false)}
      >
        <Alert onClose={() => setOpenFileError(false)} severity="error">
          Project does not exist anymore!
        </Alert>
      </Snackbar>
    </>
  );
}

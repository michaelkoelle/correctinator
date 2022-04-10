import { Box, Divider, Typography, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Project from '../model/Project';
import { selectAllProjects } from '../slices/ProjectsSlice';
import ProjectsList from './ProjectsList';
import ProjectsToolbar from './ProjectsToolbar';

export default function LauncherProjectsPage() {
  const theme = useTheme();
  const recentPaths = useSelector(selectAllProjects);
  const [searchTerm, setSearchTerm] = useState<string | undefined>();

  const projects: Project[] = recentPaths.filter((p) =>
    searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div
      style={{
        height: 'calc(100% - 45px)', // 29px TitleBar + 16px Margin
        display: 'flex',
        flexDirection: 'column',
        marginTop: '8px',
      }}
    >
      <ProjectsToolbar setSearchTerm={setSearchTerm} />
      <Divider
        variant="middle"
        style={{
          margin: '16px 8px 8px 8px',
        }}
      />
      {!searchTerm && projects.length === 0 && (
        <>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '24px',
              color: theme.palette.text.disabled,
            }}
          >
            No projects yet!
          </Typography>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              color: theme.palette.text.disabled,
            }}
          >
            You can add a project with the buttons above!
          </Typography>
        </>
      )}
      {searchTerm && projects.length === 0 && (
        <Typography
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '24px',
            color: theme.palette.text.disabled,
          }}
        >
          No matching projects for your search term!
        </Typography>
      )}
      <Box flex="1 1 0%" display="flex" flexDirection="column">
        <ProjectsList projects={projects} />
      </Box>
    </div>
  );
}

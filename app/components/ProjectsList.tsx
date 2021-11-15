import { List } from '@material-ui/core';
import React from 'react';
import Project from '../model/Project';
import ProjectListItem from './ProjectListItem';

type ProjectsListProps = {
  projects: Project[];
};

export default function ProjectsList(props: ProjectsListProps) {
  const { projects } = props;

  return (
    <List
      style={{
        flex: '1 1 0px',
        overflow: 'auto',
      }}
    >
      {projects.map((p) => (
        <ProjectListItem key={p.id} project={p} />
      ))}
    </List>
  );
}

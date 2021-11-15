import React from 'react';
import { Route } from 'react-router-dom';
import App from '../containers/App';
import Launcher from '../containers/Launcher';

interface ViewManagerProps {
  name: string;
}

export default function ViewManager(props: ViewManagerProps) {
  const { name } = props;

  const views = {
    launcher: Launcher,
    app: App,
  };

  const view = views[name];
  if (!view) {
    return <div>{`View '${name}'is undefined`}</div>;
  }

  return <Route path="/" component={view} />;
}

/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import SchemeGeneratorPage from './containers/SchemeGeneratorPage';
import OverviewPage from './containers/OverviewPage';
import CorrectionViewPage from './containers/CorrectionViewPage';
import SheetOverviewPage from './containers/SheetOverviewPage';
import FramelessTitleBar from './containers/FramelessTitleBar';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() => import('./containers/CounterPage'));

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <FramelessTitleBar />
      <Switch>
        <Route path={routes.SHEETOVERVIEW} component={SheetOverviewPage} />
        <Route path={routes.CORRECTIONVIEW} component={CorrectionViewPage} />
        <Route path={routes.OVERVIEW} component={OverviewPage} />
        <Route path={routes.SCHEMAGENERATOR} component={SchemeGeneratorPage} />
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}

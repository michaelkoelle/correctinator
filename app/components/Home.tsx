import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import {
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
} from '../utils/FileAccess';
import styles from './Home.css';

export default function Home(): JSX.Element {
  const [submissions, setSubmissions] = React.useState([]) as any;
  const [selected, setSelected] = React.useState({}) as any;

  function loadSubmissions() {
    const path = getSubmissionDir();
    const subs: any[] = [];
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    submissionDirectories.forEach((dir, i) => {
      const temp = getSubmissionFromAppDataDir(dir);
      temp.id = i;
      subs.push(temp);
    });
    setSubmissions(subs);
    if (subs.length > 0) {
      setSelected(subs[0]);
    }
  }
  useEffect(() => console.log(submissions));
  useEffect(() => loadSubmissions(), []);

  return (
    <div className={styles.container} data-tid="container">
      <h2>correctinator v1.0</h2>
      <br />
      <Link to={routes.SCHEMAGENERATOR}>to Schema Generator</Link>
      <br />
      <Link to={routes.OVERVIEW}>to Overview</Link>
      <br />
      <Link
        to={{
          pathname: routes.CORRECTIONVIEW,
          state: { submission: selected, submissions },
        }}
      >
        to CorrectionView
      </Link>
    </div>
  );
}

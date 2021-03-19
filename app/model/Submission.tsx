/* eslint-disable import/no-cycle */
import Correction from './Correction';
import File from './File';
import Sheet from './Sheet';

type Submission = {
  id: string;
  name: string;
  sheet: Sheet;
  matNr?: string;
  correction?: Correction;
  files?: File[];
};
export default Submission;

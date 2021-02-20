/* eslint-disable import/no-cycle */
import Correction from './Correction';
import Sheet from './Sheet';

type Submission = {
  id: string;
  name: string;
  sheet: Sheet;
  matNr?: string;
  correction?: Correction;
};
export default Submission;

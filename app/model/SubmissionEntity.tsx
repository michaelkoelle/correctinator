import File from './File';

type SubmissionEntity = {
  id: string;
  name: string;
  sheet: string;
  matNr?: string;
  correction?: string;
  files?: File[];
};
export default SubmissionEntity;

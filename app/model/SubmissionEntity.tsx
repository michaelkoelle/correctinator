type SubmissionEntity = {
  id: string;
  name: string;
  files: string[];
  sheet: string;
  correction?: string;
};
export default SubmissionEntity;

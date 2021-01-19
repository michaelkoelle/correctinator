import Status from './Status';

type CorrectionEntity = {
  id: string;
  submission: string;
  corrector: string;
  status: Status;
  location?: string;
  note?: string;
  annotation?: string;
};

export default CorrectionEntity;

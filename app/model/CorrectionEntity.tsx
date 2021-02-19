import Status from './Status';

type CorrectionEntity = {
  id: string;
  submission: string;
  corrector: string;
  ratings?: string[];
  status: Status;
  location: string;
  note?: string;
  annotation?: string;
  timeElapsed?: number;
  autoCorrectionAttempted?: boolean;
};

export default CorrectionEntity;

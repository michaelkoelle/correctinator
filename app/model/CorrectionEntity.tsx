import Status from './Status';

type Correction = {
  id: string;
  submission: string;
  corrector: string;
  status: Status;
  location?: string;
  note?: string;
  annotation?: string;
};

export default Correction;

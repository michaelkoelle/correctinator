import Correction from '../model/Correction';

export default interface Parser {
  configFilePattern: RegExp;
  deserialize(text: string): Correction;
  serialize(correction: Correction, tasksAndComments?: string): string;
  getConfigFileName(correction: Correction): string;
}

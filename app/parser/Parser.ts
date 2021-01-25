import Correction from '../model/Correction';

export default interface Parser {
  configFilePattern: string;
  deserialize(text: string): Correction;
  serialize(correction: Correction, tasksAndComments?: string): string;
}

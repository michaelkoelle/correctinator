import Correction from '../model/Correction';

export enum ParserType {
  Uni2Work = 'UNI2WORK',
}

export default interface Parser {
  configFilePattern: RegExp;
  deserialize(text: string, dirName: string): Correction;
  serialize(correction: Correction, tasksAndComments?: string): string;
  getConfigFileName(correction: Correction): string;
  getType(): ParserType;
}

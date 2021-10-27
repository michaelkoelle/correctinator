import Correction from '../model/Correction';
import ParserType from './ParserType';

export default interface Parser {
  configFilePattern: RegExp;
  deserialize(text: string, dirName: string, fileName: string): Correction;
  serialize(correction: Correction, tasksAndComments?: string): string;
  getConfigFileName(correction: Correction): string;
  getType(): ParserType;
}

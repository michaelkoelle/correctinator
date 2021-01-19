import Correction from '../model/Correction';

export default abstract class Parser {
  static deserialize(payload: { data: string; files: string[] }): Correction {
    throw new Error('Method not implemented.');
  }

  static serialize(correction: Correction): string {
    throw new Error('Method not implemented.');
  }
}

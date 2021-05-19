import Parser, { ParserType } from './Parser';
import Uni2WorkParser from './Uni2WorkParser';

const instanciateParser = (type: ParserType): Parser => {
  switch (type) {
    case ParserType.Uni2Work:
      return new Uni2WorkParser();
    default:
      return new Uni2WorkParser();
  }
};

export default instanciateParser;

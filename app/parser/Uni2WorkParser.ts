/* eslint-disable class-methods-use-this */
import YAML from 'yaml';
import Parser from './Parser';
import UUID from '../utils/UUID';
import Term from '../model/Term';
import Correction from '../model/Correction';
import Status from '../model/Status';
import Corrector from '../model/Corrector';
import Location from '../model/Location';
import Course from '../model/Course';
import School from '../model/School';
import Rating from '../model/Rating';

export type Uni2WorkDataStructure = {
  term: string;
  school: string;
  course: string;
  sheet: {
    name: string;
    type: string;
    grading: {
      max: number;
      type: string;
    };
  };
  rated_by: string;
  rated_at: string | null;
  submission: string;
  points: number | null;
  rating_done: boolean;
};

export default class Uni2WorkParser implements Parser {
  public configFilePattern = /bewertung_([a-z0-9]{16})\.txt/g;

  public deserialize(text: string): Correction {
    const u2wDoc = YAML.parseDocument(text);

    if (u2wDoc.errors.length > 0) {
      throw new Error(`Could not parse the rating file!`);
    }

    // TODO: Validate JSON against its type
    const u2wData: Uni2WorkDataStructure = u2wDoc.toJSON();

    const correction: Correction = {
      id: UUID.v5(`correction-${u2wData.submission}`),
      submission: {
        id: UUID.v5(u2wData.submission),
        name: u2wData.submission,
        sheet: {
          id: UUID.v5(
            `${u2wData.school}-${u2wData.course}-${u2wData.term}-${u2wData.sheet.name}`
          ),
          name: u2wData.sheet.name,
          type: u2wData.sheet.type,
          maxValue: u2wData.sheet.grading.max,
          valueType: u2wData.sheet.grading.type,
          school: Uni2WorkParser.deserializeSchool(u2wData.school),
          term: Uni2WorkParser.deserializeTerm(u2wData.term),
          course: Uni2WorkParser.deserializeCourse(
            u2wData.course,
            u2wData.school
          ),
        },
      },
      corrector: Uni2WorkParser.deserializeCorrector(u2wData.rated_by),
      status: Uni2WorkParser.deserializeStatus(u2wData.rating_done),
      location: Uni2WorkParser.deserializeLocation(u2wData.rated_at),
    };
    correction.submission.correction = correction;

    return correction;
  }

  public static deserializeTerm(term: string): Term {
    // More detailed: 1. WiSe|SoSe 2. Century e.g. 20 3. Year start 4. Year end (only WiSe)
    // const termPattern = /(wise|sose)\s*(\d{2})(\d{2})(?:\/(\d{2}))?/gi;
    const termPattern = /(wise|sose)\s*(\d{4})/i;
    const summertermPattern = /sose/gi;
    const termGroups = term.match(termPattern);
    if (termGroups === null) {
      throw new Error(`Could not parse term!`);
    }
    const termYear = Number.parseInt(termGroups[2], 10);
    const termType = termGroups[1];

    return {
      id: UUID.v5(`${termType}-${termYear}`),
      year: termYear,
      summerterm: termType.match(summertermPattern) !== null,
    };
  }

  public static serializeTerm(term: Term): string {
    return `${term.summerterm ? 'SoSe' : 'WiSe'} ${term.year}${
      term.summerterm ? '' : `/${String(term.year + 1).slice(-2)}`
    }`;
  }

  public static deserializeSchool(school: string): School {
    return {
      id: UUID.v5(school),
      name: school,
    };
  }

  public static deserializeCourse(course: string, school: string): Course {
    return {
      id: UUID.v5(`${school}-${course}`),
      name: course,
    };
  }

  public static deserializeCorrector(rated_by: string): Corrector {
    return {
      id: UUID.v5(rated_by),
      name: rated_by,
    };
  }

  public static deserializeLocation(rated_at: string | null): Location {
    return {
      id: UUID.v5(String(rated_at)),
      name: rated_at,
    };
  }

  public static deserializeStatus(rating_done: boolean): Status {
    return rating_done ? Status.Done : Status.Todo;
  }

  public static serializeRating(ratings: Rating[]): number {
    return ratings.map((r) => r.value).reduce((acc, r) => acc + r);
  }

  public serialize(correction: Correction, tasksAndComments = ''): string {
    const u2wData: Uni2WorkDataStructure = {
      term: Uni2WorkParser.serializeTerm(correction.submission.sheet.term),
      school: correction.submission.sheet.school.name,
      course: correction.submission.sheet.course.name,
      sheet: {
        name: correction.submission.sheet.name,
        type: correction.submission.sheet.type,
        grading: {
          max: correction.submission.sheet.maxValue,
          type: correction.submission.sheet.valueType,
        },
      },
      rated_by: correction.corrector.name,
      rated_at:
        correction.location === undefined ? null : correction.location.name,
      submission: correction.submission.name,
      points: correction.ratings
        ? Uni2WorkParser.serializeRating(correction.ratings)
        : null,
      rating_done: correction.status === Status.Done,
    };

    const doc = new YAML.Document(u2wData);
    return `${doc.toString()}...\n${tasksAndComments}`;
  }
}

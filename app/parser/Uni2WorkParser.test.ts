import Correction from '../model/Correction';
import Status from '../model/Status';
import Parser from './Parser';
import Uni2WorkParser, { Uni2WorkDataStructure } from './Uni2WorkParser';

const parser: Parser = new Uni2WorkParser();

const u2wTestString1 = `
%YAML 1.2
---
# Meta-Informationen zur Korrektur (werden beim Hochladen ignoriert)
term: SoSe 2020
school: Institut für Informatik
course: Rechnerarchitektur
sheet:
  name: Online-Hausarbeit 5
  type: normal
  grading:
    max: 10
    type: points
rated_by: John Doe
rated_at: null

# Abgabenummer; wird beim Hochladen mit dem Dateinamen abgeglichen
submission: uwazxvya2akrnnc2

# Bewertung
points: null # TODO: Hier die Punktezahl statt null eintragen (bis zu zwei Nachkommastellen, Punkt als Dezimalseparator; z.B. 17.03)
rating_done: false # TODO: Von false auf true setzen, sobald Bewertung abgeschlossen; sonst Korrektur für die Studierenden nicht sichtbar und keine Anrechnung auf Prüfungsbonus

# TODO: Korrektur-Kommentar für die Studierenden unterhalb der Abtrennung (...) eintragen
...`;

const u2wTestData1: Uni2WorkDataStructure = {
  term: 'SoSe 2020',
  school: 'Institut für Informatik',
  course: 'Rechnerarchitektur',
  sheet: {
    name: 'Online-Hausarbeit 5',
    type: 'normal',
    grading: { max: 10, type: 'points' },
  },
  rated_by: 'John Doe',
  rated_at: null,
  submission: 'uwazxvya2akrnnc2',
  points: null,
  rating_done: false,
};

const correctionTestData1: Correction = {
  id: '5475c708-3ced-5ff5-ad51-a1c12f8a2757',
  submission: {
    id: 'd519b90c-6b6e-5d67-9e0d-318f05693b01',
    name: 'uwazxvya2akrnnc2',
    sheet: {
      id: 'e9a0d6f5-14ab-55b2-9973-c3be7f1f7c73',
      name: 'Online-Hausarbeit 5',
      type: 'normal',
      maxValue: 10,
      valueType: 'points',
      school: {
        id: '344bd582-e110-53f6-a10c-6a14d6a7e291',
        name: 'Institut für Informatik',
      },
      term: {
        id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
        year: 2020,
        summerterm: true,
      },
      course: {
        id: '73ae54b7-afdd-5912-a5d0-a1dd488fe912',
        name: 'Rechnerarchitektur',
      },
    },
  },
  corrector: {
    id: 'b3aa67d2-4ae3-5441-860a-88ab5391673d',
    name: 'John Doe',
  },
  status: Status.Todo,
  location: {
    id: '148bdfa9-7596-5319-a197-ead64880df40',
    name: null,
  },
  // note: { text: '' },
  // annotation: { text: '' },
};
correctionTestData1.submission.correction = correctionTestData1;

const u2wTestString2 = `term: SoSe 2020
school: Institut für Informatik
course: Rechnerarchitektur
sheet:
  name: Online-Hausarbeit 5
  type: normal
  grading:
    max: 10
    type: points
rated_by: John Doe
rated_at: null
submission: uwazxvya2akrnnc2
points: 8.5
rating_done: false
...
`;

const correctionTestData2: Correction = {
  id: '5475c708-3ced-5ff5-ad51-a1c12f8a2757',
  ratings: [
    {
      id: 'f928b81f-2bba-5635-8633-94fc0bc89b68',
      value: 2,
      comment: {
        id: '87f4c40a-9d62-4b7c-872c-bb3e97b37f9d',
        text: '',
        task: {
          id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
          name: 'Task 1.1',
          max: 3,
          step: 1,
        },
      },
      task: {
        id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
        name: 'Task 1.1',
        max: 3,
        step: 1,
      },
    },
    {
      id: 'c0efdf57-9b65-564c-a12b-f6e2907e7cd9',
      value: 1.5,
      comment: {
        id: 'fbca3ab5-3882-4d92-b590-9b1fa1136f51',
        text: '',
        task: {
          id: '3de4bec5-5608-44f7-8dad-08022b61a232',
          name: 'Task 1.2',
          max: 2,
          step: 0.5,
        },
      },
      task: {
        id: '3de4bec5-5608-44f7-8dad-08022b61a232',
        name: 'Task 1.2',
        max: 2,
        step: 0.5,
      },
    },
    {
      id: '50d53aa3-5e3b-5d2f-8239-9c51db727b10',
      value: 5,
      comment: {
        id: 'b5f89b6e-b27c-408a-9b7e-392923f0d55b',
        text: '',
        task: {
          id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
          name: 'Task 2',
          max: 5,
          step: 1,
        },
      },
      task: {
        id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
        name: 'Task 2',
        max: 5,
        step: 1,
      },
    },
  ],
  submission: {
    id: 'd519b90c-6b6e-5d67-9e0d-318f05693b01',
    name: 'uwazxvya2akrnnc2',
    sheet: {
      id: 'e9a0d6f5-14ab-55b2-9973-c3be7f1f7c73',
      name: 'Online-Hausarbeit 5',
      type: 'normal',
      tasks: [
        {
          id: 'f48d7ba3-b6ad-443b-9ea2-e180889cdb3f',
          name: 'Task 1',
          tasks: [
            {
              id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
              name: 'Task 1.1',
              max: 3,
              step: 1,
            },
            {
              id: '3de4bec5-5608-44f7-8dad-08022b61a232',
              name: 'Task 1.2',
              max: 2,
              step: 0.5,
            },
          ],
        },
        {
          id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
          name: 'Task 2',
          max: 5,
          step: 1,
        },
      ],
      maxValue: 10,
      valueType: 'points',
      school: {
        id: '344bd582-e110-53f6-a10c-6a14d6a7e291',
        name: 'Institut für Informatik',
      },
      term: {
        id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
        year: 2020,
        summerterm: true,
      },
      course: {
        id: '73ae54b7-afdd-5912-a5d0-a1dd488fe912',
        name: 'Rechnerarchitektur',
      },
    },
  },
  corrector: {
    id: 'b3aa67d2-4ae3-5441-860a-88ab5391673d',
    name: 'John Doe',
  },
  status: Status.Todo,
  location: {
    id: '148bdfa9-7596-5319-a197-ead64880df40',
    name: null,
  },
  // note: { text: '' },
  // annotation: { text: '' },
};
correctionTestData2.submission.correction = correctionTestData2;

const u2wTestData2: Uni2WorkDataStructure = {
  term: 'WiSe 2020/21',
  school: 'Institut für Informatik',
  course: 'Betriebssysteme',
  sheet: {
    name: 'Übungsblatt 9',
    type: 'normal',
    grading: { max: 22, type: 'points' },
  },
  rated_by: 'Jane Doe',
  rated_at: null,
  submission: 'uwarfnbp2hzfkyk6',
  points: null,
  rating_done: false,
};

const u2wTestString3 = `term: SoSe 2020
school: Institut für Informatik
course: Rechnerarchitektur
sheet:
  name: Online-Hausarbeit 5
  type: exam-part-points
  grading:
    max: 10
    type: points
  exam-part:
    exam-name: Test Klausur
    exam-part-number: 1
  weight:
    denominator: 1
    numerator: 1
rated_by: John Doe
rated_at: null
submission: uwazxvya2akrnnc2
points: null
rating_done: false
...
`;

const correctionTestData3: Correction = {
  id: '5475c708-3ced-5ff5-ad51-a1c12f8a2757',
  submission: {
    id: 'd519b90c-6b6e-5d67-9e0d-318f05693b01',
    name: 'uwazxvya2akrnnc2',
    sheet: {
      id: 'e9a0d6f5-14ab-55b2-9973-c3be7f1f7c73',
      name: 'Online-Hausarbeit 5',
      type: 'exam-part-points',
      maxValue: 10,
      valueType: 'points',
      school: {
        id: '344bd582-e110-53f6-a10c-6a14d6a7e291',
        name: 'Institut für Informatik',
      },
      term: {
        id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
        year: 2020,
        summerterm: true,
      },
      course: {
        id: '73ae54b7-afdd-5912-a5d0-a1dd488fe912',
        name: 'Rechnerarchitektur',
      },
      examPart: {
        examName: 'Test Klausur',
        examPartNumber: 1,
      },
      weight: {
        denominator: 1,
        numerator: 1,
      },
    },
  },
  corrector: {
    id: 'b3aa67d2-4ae3-5441-860a-88ab5391673d',
    name: 'John Doe',
  },
  status: Status.Todo,
  location: {
    id: '148bdfa9-7596-5319-a197-ead64880df40',
    name: null,
  },
};
correctionTestData3.submission.correction = correctionTestData3;

// Term

test('serializeTerm SoSe 2020', () => {
  expect(
    Uni2WorkParser.serializeTerm({
      id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
      year: 2020,
      summerterm: true,
    })
  ).toBe(u2wTestData1.term);
});

test('serializeTerm WiSe 2020/21', () => {
  expect(
    Uni2WorkParser.serializeTerm({
      id: 'cc47b29b-a507-533f-b4db-1fee84ed81fb',
      year: 2020,
      summerterm: false,
    })
  ).toBe(u2wTestData2.term);
});

test('deserializeTerm SoSe 2020', () => {
  expect(Uni2WorkParser.deserializeTerm(u2wTestData1.term)).toStrictEqual({
    id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
    year: 2020,
    summerterm: true,
  });
});

test('deserializeTerm WiSe 2020/21', () => {
  expect(Uni2WorkParser.deserializeTerm(u2wTestData2.term)).toStrictEqual({
    id: 'cc47b29b-a507-533f-b4db-1fee84ed81fb',
    year: 2020,
    summerterm: false,
  });
});

// Status

test('deserializeStatus with rating_done false', () => {
  expect(Uni2WorkParser.deserializeStatus(false)).toBe(Status.Todo);
});

test('deserializeStatus with rating_done true', () => {
  expect(Uni2WorkParser.deserializeStatus(true)).toBe(Status.Done);
});

// Location

test('deserializeLocation null', () => {
  expect(
    Uni2WorkParser.deserializeLocation(u2wTestData1.rated_at)
  ).toStrictEqual({
    id: '148bdfa9-7596-5319-a197-ead64880df40',
    name: null,
  });
});

test('deserializeLocation Munich', () => {
  expect(Uni2WorkParser.deserializeLocation('Munich')).toStrictEqual({
    id: 'e4b71e7c-a7f0-5d59-a39d-6530c4d33384',
    name: 'Munich',
  });
});

// Corrector

test('deserializeCorrector John Doe', () => {
  expect(
    Uni2WorkParser.deserializeCorrector(u2wTestData1.rated_by)
  ).toStrictEqual({
    id: 'b3aa67d2-4ae3-5441-860a-88ab5391673d',
    name: 'John Doe',
  });
});

// Course

test('deserializeCourse Rechnerarchitektur', () => {
  expect(
    Uni2WorkParser.deserializeCourse(u2wTestData1.course, u2wTestData1.school)
  ).toStrictEqual({
    id: '73ae54b7-afdd-5912-a5d0-a1dd488fe912',
    name: 'Rechnerarchitektur',
  });
});

// School

test('deserializeSchool Institut für Informatik', () => {
  expect(Uni2WorkParser.deserializeSchool(u2wTestData1.school)).toStrictEqual({
    id: '344bd582-e110-53f6-a10c-6a14d6a7e291',
    name: 'Institut für Informatik',
  });
});

// Correction

test('deserialize Correction u2wTestData1', () => {
  expect(parser.deserialize(u2wTestString1, 'uwazxvya2akrnnc2')).toMatchObject(
    correctionTestData1
  );
});

test('serialize correctionTestData2', () => {
  expect(parser.serialize(correctionTestData2)).toContain(u2wTestString2);
});

test('serialize Exam correctionTestData3', () => {
  expect(parser.serialize(correctionTestData3)).toContain(u2wTestString3);
});

// Rating

test('serializeRating correctionTestData2', () => {
  expect(
    correctionTestData2.ratings
      ? Uni2WorkParser.serializeRating(correctionTestData2.ratings)
      : null
  ).toBe(8.5);
});

test('getConfigFileName correctionTestData2', () => {
  expect(parser.getConfigFileName(correctionTestData2)).toBe(
    'bewertung_uwazxvya2akrnnc2.txt'
  );
});

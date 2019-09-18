import { SUBMISSION_STATES } from '../constants/submission';

export function parse(content) {
  // https://regex101.com/r/MgTRms/1
  const regex = new RegExp("= Bitte nur Bewertung und Kommentare ändern =\n"
    + "=============================================\n"
    + "========== UniWorx Bewertungsdatei ==========\n"
    + "======= diese Datei ist UTF8 encodiert ======\n"
    + "Informationen zum Übungsblatt:\n"
    + "Veranstaltung: (.+)\n"
    + "Blatt: (.+)\n"
    + "Korrektor: (.+)\n"
    + "E-Mail: (.+)\n"
    + "Abgabe-Id: (.+)\n"
    + "Maximalpunktzahl: (\\d+[.|,]?\\d*).*\n"
    + "=============================================\n"
    + "Bewertung: (\\d*[.|,]?\\d*).*\n"
    + "=============================================\n"
    + "Kommentare:\n"
    + "\\s*((?:(?:(?:[^\\n]*[:|)])\\s*(?:\\d+[,|\\.]\\d+|\\d+)\\/(?:\\d+[,|\\.]\\d+|\\d+))\\s*\\n(?:^(?:\\t+[^\\t\\n]+\\n*))*\\s*)*\\s*)\\s*(.*?)\\s*(?:\\/\\*(.*)\\*\\/)?\\s*\n"
    + "============ Ende der Kommentare ============",'gm');

  const match = regex.exec(content);

  const submission = {
    submissionId: undefined,
    maxpoints: 0.0,
    state: SUBMISSION_STATES.TODO,
    lecture: undefined,
    exercise: undefined,
    corrector: undefined,
    comment: undefined,
    note: undefined,
    tasks: []
  };

  if(match){
    const [ , lecture, exercise, correctorName, correctorEmail, submissionId, maxpoints, score, tasks, comment, note] = match;

    if(score.trim() !== ""){
      submission.state = SUBMISSION_STATES.FINISHED;
    }

    if(note){
      submission.state = SUBMISSION_STATES.MARKED_FOR_LATER;
    }

    if(tasks === "\n" || tasks.trim().length === 0){
      submission.state = SUBMISSION_STATES.NOT_INITIALIZED;
    }

    submission.submissionId = submissionId;
    submission.score = extractFloatFromString(score);
    submission.maxpoints = extractFloatFromString(maxpoints);
    submission.lecture = lecture;
    submission.exercise = exercise;
    submission.corrector = {
      name: correctorName,
      email: correctorEmail
    };
    submission.comment = {
      text: comment
    };
    submission.note = note;
    submission.tasks = parseTasks(tasks)

  }else{
    submission.state = SUBMISSION_STATES.PARSE_ERROR;
  }

  return submission;
}

export function stringify() {
  return "TEST";
}

function extractFloatFromString(s){
  const regex = new RegExp("(\\d+[.|,]?\\d*)");
  const match = regex.exec(s);
  if(match){
   return parseFloat(match[1].replace(',','.'))
  }
}


function parseTasks(contents, tasks = [], parent = undefined) {
  const regex = new RegExp("(?=(?:^[^\\s][^:|)]*[:|)])\\s*(?:\\d+[,|\\.]\\d+|\\d+)\\/(?:\\d+[,|\\.]\\d+|\\d+))", 'gm');

  if(contents === undefined){
    return tasks;
  }

  const taskSplit = contents.split(regex);

  if(!taskSplit){
    // TODO: File not initialized
  }

  taskSplit.forEach(subtask => {
    const t = parseTask(subtask);
    t.parent = parent;
    if(parent){
      parent.subtasks.push(t);
    }else{
      tasks.push(t);
    }

    if(countSubtasks(subtask)>1){
      parseTasks(unwrapParentTask(subtask), tasks, t);
    }

  });

  return tasks;
}

function unwrapParentTask(content){
  let lines = content.split('\n');
  lines.splice(0,1);
  lines = lines.map(line => line.substring(1));
  return lines.join('\n');
}

function parseTask(contents){
  // https://regex101.com/r/G1jcxf/2
  const regex = new RegExp("(?: |\\t)*([^\\n]+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)[\\t| ]*\\n?(\\t*\\S.*)?", 'gms');

  const match = regex.exec(contents);
  let comment = "";

  if(countSubtasks(contents)<=1 && match[4]){
    let lines = match[4].split('\n');
    lines = lines.map(line => line.substring(1));
    comment = lines.join('\n');
  }

  return {
    name: match[1],
    rating: {
      score: extractFloatFromString(match[2])
    },
    maxpoints: extractFloatFromString(match[3]),
    comment: {
      text: comment
    },
    subtasks: []
  };
}


function countSubtasks(str){
  const re = new RegExp("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)", 'gm');
  return ((str || '').match(re) || []).length
}

/*
public static void parseExercises(String exercises, Exercise parent) throws ParseRatingFileCommentSectionException, FileNotInitializedException {
  Pattern patternTest = Pattern.compile("(?m)^[^\\r\\t\\f\\v].*", Pattern.MULTILINE);
  Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");

  String[] exerciseSplit = splitWithDelimiters(exercises, patternTest.pattern());

  if(exerciseSplit.length == 0){
    throw new FileNotInitializedException();
  }

  for(String s : exerciseSplit){
    int count = countPatternInString(s, patternExercise);
    if(count > 1) {
      Exercise e = parseExercise(s, parent.getCorrection());
      Scanner scanner = new Scanner(s);

      StringBuilder newS = new StringBuilder();

      while (scanner.hasNextLine()){
        String line = scanner.nextLine();
        if(line.startsWith("\t")){
          newS.append(line.substring(1)).append("\n");
        }
      }

      if(parent != null){
        parent.addSubExercise(e);
      }
      e.setParent(parent);
      parseExercises(newS.toString(),e);
    }else{
      Exercise e = parseExerciseRating(s, parent.getCorrection());
      if(parent != null){
        parent.addSubExercise(e);
      }
      e.setParent(parent);
    }
  }
}

public static int countPatternInString(String input, Pattern pattern){
  return input.split(pattern.toString(),-1).length - 1;
}

public static ExerciseRating parseExerciseRating(String plain, Correction c) throws ParseRatingFileCommentSectionException {
  Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");
  Scanner lineScanner = new Scanner(plain);
  String line;
  if(lineScanner.hasNext()){
    line = lineScanner.nextLine();
    Matcher matcher = patternExercise.matcher(line);
    if(matcher.find()){
      ExerciseRating  e = new ExerciseRating();
      e.setCorrection(c);
      e.setName(matcher.group(2));
      e.setRating(Double.parseDouble(matcher.group(3).replace(",",".")));
      e.setMaxPoints(Double.parseDouble(matcher.group(4).replace(",",".")));

      while (lineScanner.hasNext()){
        String l = lineScanner.nextLine();
        if(l.startsWith("\t")){
          e.setComment(e.getComment()+ l.substring(1) +"\n");
        }
        else{
          e.setComment(e.getComment()+ l +"\n");
        }
      }

      return e;
    }
  }

  throw new ParseRatingFileCommentSectionException(plain);
}

public static Exercise parseExercise(String plain, Correction c) throws ParseRatingFileCommentSectionException {
  Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");
  Scanner lineScanner = new Scanner(plain);
  String line;
  if(lineScanner.hasNext()){
    line = lineScanner.nextLine();
    Matcher matcher = patternExercise.matcher(line);
    if(matcher.find()){
      Exercise  e = new Exercise();
      e.setCorrection(c);
      e.setName(matcher.group(2));
      return e;
    }
  }

  throw new ParseRatingFileCommentSectionException(plain);
}

 */

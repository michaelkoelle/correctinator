package com.koellemichael.utils;

import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RatingFileParser {

    public static Correction parseFile(String path) throws ParseException, IOException, FileNotInitializedException {

        Correction c = new Correction();
        c.setPath(path);
        File file = new File(path);

        Scanner chunkScanner = new Scanner(file);
        chunkScanner.useDelimiter("=.*=");

        while(chunkScanner.hasNext()){
            String chunk = chunkScanner.next().trim();

            if(!chunk.isEmpty()){

                if(chunk.contains("Kommentare")) {
                    Scanner s = new Scanner(chunk);
                    if(s.hasNextLine()){
                        s.nextLine();
                    }

                    StringBuilder content = new StringBuilder();
                    //TODO Method bauen die erste line löscht
                    while(s.hasNextLine()){
                        content.append(s.nextLine()).append("\n");
                    }

                    Exercise e = new Exercise();
                    parseExercises(content.toString(), e);
                    c.setExercise(e);

                }else{
                    Scanner lineScanner = new Scanner(chunk);
                    while(lineScanner.hasNextLine()){
                        String line = lineScanner.nextLine();
                        Scanner valueScanner = new Scanner(line);
                        valueScanner.useDelimiter(":");

                        String key = null;
                        String value = null;
                        if(valueScanner.hasNext()){
                            key = valueScanner.next().trim();
                        }
                        if(valueScanner.hasNext()){
                            value = valueScanner.next().trim();
                        }

                        if (key != null) {
                            switch (key){
                                case "Veranstaltung": c.setLecture(value); break;
                                case "Blatt": c.setExerciseSheet(value); break;
                                case "Korrektor": c.setCorrector(value); break;
                                case "E-Mail": c.setCorrectorEmail(value); break;
                                case "Abgabe-Id": c.setId(value); break;
                                case "Maximalpunktzahl": c.setMaxPoints(extractDoubleFromString(value)); break;
                                //case "Bewertung": c.setRating(extractDoubleFromString(value)); break;
                            }
                        }

                        valueScanner.close();
                    }

                    lineScanner.close();
                }


            }
        }
        chunkScanner.close();

        return c;
    }

    public static String buildRatingFile(Correction c){
        DecimalFormat format = new DecimalFormat("0.#");
        String ratingFileContent =
                "= Bitte nur Bewertung und Kommentare ändern =\n" +
                "=============================================\n" +
                "========== UniWorx Bewertungsdatei ==========\n" +
                "======= diese Datei ist UTF8 encodiert ======\n" +
                "Informationen zum Übungsblatt:\n" +
                "Veranstaltung: " + c.getLecture() + "\n" +
                "Blatt: " + c.getExerciseSheet() + "\n" +
                "Korrektor: " + c.getCorrector() + "\n" +
                "E-Mail: " + c.getCorrectorEmail() + "\n" +
                "Abgabe-Id: " + c.getId() + "\n" +
                "Maximalpunktzahl: " + format.format(c.getMaxPoints()) + " Punkte\n" +
                "=============================================\n" +
                "Bewertung: " + format.format(c.getRating()) + "\n" +
                "=============================================\n" +
                "Kommentare:\n";

                for(Exercise e : c.getExercise().getSubExercises()){
                    if(e instanceof ExerciseRating){
                        ExerciseRating er = (ExerciseRating) e;
                    }
                    //TODO
                    //ratingFileContent += e.getName() + " " + format.format(e.getRating()) + "/" + format.format(e.getMaxPoints()) + "\n";
                    //if(e.getComment() != null && !e.getComment().isEmpty()){
                    //    ratingFileContent += "\t" + formatComment(e.getComment(), "\n\t") + "\n";
                    //}

                    //for(Exercise sub : c.getExercise().getSubExercises()){
                    //    ratingFileContent += "\t" + sub.getName() + " " + format.format(sub.getRating()) + "/" + format.format(sub.getMaxPoints()) + "\n";
                    //    if(sub.getComment() != null && !sub.getComment().isEmpty()) {
                   //         ratingFileContent += "\t\t" + formatComment(sub.getComment(), "\n\t\t") + "\n";
                    //    }
                    //}
                    ratingFileContent += "\n";
                }

                ratingFileContent += "============ Ende der Kommentare ============\n";
                return ratingFileContent;
    }

    public static double extractDoubleFromString(String s) throws IOException {
        Pattern pattern = Pattern.compile("\\D*(\\d*[\\.|,]*\\d*)\\D*");
        Matcher matcher = pattern.matcher(s);
        if (matcher.find())
        {
            return Double.parseDouble(matcher.group(1).replace(",","."));
        }

        throw new IOException();
    }

    public static String formatComment(String s, String replacement){
        //TODO
        //s = s.replaceAll("(\\S+[\\s|\\t]*){10}", "$0"+ replacement);
        s = s.replaceAll("\n",replacement);
        s = s.trim();

        return s;
    }

    public static void saveRatingFile(Correction c) throws IOException {
        System.out.println("Saving file: " + c.getPath());
        BufferedWriter writer = new BufferedWriter(new FileWriter(c.getPath()));
        writer.write(buildRatingFile(c));
        writer.close();
        c.setChanged(false);
    }

    private static String[] splitWithDelimiters(String str, String regex) {
        List<String> parts = new ArrayList<>();

        Pattern p = Pattern.compile(regex);
        Matcher m = p.matcher(str);

        String lastDelim = "";
        int lastEnd = 0;
        while(m.find()) {
            int start = m.start();
            if(lastEnd != start) {
                String nonDelim = str.substring(lastEnd, start);
                parts.add(lastDelim + nonDelim);
            }
            lastDelim= m.group();
            lastEnd = m.end();
        }

        if(lastEnd != str.length()) {
            String nonDelim = str.substring(lastEnd);
            parts.add(lastDelim+nonDelim);
        }


        return parts.toArray(new String[]{});
    }

    public static void parseExercises(String exercises, Exercise parent) throws ParseException, FileNotInitializedException {
        Pattern patternTest = Pattern.compile("(?m)^\\S.*", Pattern.MULTILINE);
        Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");

        String[] exerciseSplit = splitWithDelimiters(exercises, patternTest.pattern());

        if(exerciseSplit.length == 0){
            throw new FileNotInitializedException();
        }

        for(String s : exerciseSplit){
            int count = countPatternInString(s, patternExercise);
            //System.out.println("Pattern Count: " + count);
            if(count > 1) {
                Exercise e = parseExercise(s);
                Scanner scanner = new Scanner(s);

                StringBuilder newS = new StringBuilder();

                while (scanner.hasNextLine()){
                    String line = scanner.nextLine();
                    if(line.startsWith("\t")){
                        newS.append(line.substring(1)).append("\n");
                    }
                }

                //System.out.println(newS);

                if(parent != null){
                    parent.addSubExercise(e);
                }
                e.setParent(parent);
                parseExercises(newS.toString(),e);
            }else{
                Exercise e = parseExerciseRating(s);
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

    public static ExerciseRating parseExerciseRating(String plain) throws ParseException {
        Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");
        Scanner lineScanner = new Scanner(plain);
        String line;
        if(lineScanner.hasNext()){
            line = lineScanner.nextLine();
            Matcher matcher = patternExercise.matcher(line);
            if(matcher.find()){
                ExerciseRating  e = new ExerciseRating();
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

        throw new ParseException(plain);
    }

    public static Exercise parseExercise(String plain) throws ParseException {
        Pattern patternExercise = Pattern.compile("( |\\t)*(.+[:|)])\\s*(\\d+[,|\\.]\\d+|\\d+)\\/(\\d+[,|\\.]\\d+|\\d+)");
        Scanner lineScanner = new Scanner(plain);
        String line;
        if(lineScanner.hasNext()){
            line = lineScanner.nextLine();
            Matcher matcher = patternExercise.matcher(line);
            if(matcher.find()){
                Exercise  e = new Exercise();
                e.setName(matcher.group(2));
                return e;
            }
        }

        throw new ParseException(plain);
    }

}

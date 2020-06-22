package com.koellemichael.utils;

import com.koellemichael.exceptions.FileNotInitializedException;
import com.koellemichael.exceptions.ParseRatingFileCommentSectionException;
import com.koellemichael.exceptions.ParseRatingFileException;
import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class Uni2WorkParser {

    public static Correction parseFile(String path) throws ParseRatingFileException, IOException, FileNotInitializedException {
        //old https://regex101.com/r/TwuLi3/1
        //https://regex101.com/r/TwuLi3/2
        //https://regex101.com/r/TwuLi3/3
        Pattern p = Pattern.compile(
                "= Bitte nur Bewertung und Kommentare ändern =\\s+" +
                        "=============================================\\s+" +
                        "========== Uni2work Bewertungsdatei =========\\s+" +
                        "======= diese Datei ist UTF8 encodiert ======\\s+" +
                        "Informationen zum Übungsblatt:\\s+" +
                        "  Veranstaltung: (.+)\\s+" +
                        "  Blatt: (.+)\\s+" +
                        "  Korrektor: (.+)\\s+" +
                        "  Bewertung\\w*: (?>Maximal )?(\\d*[.|,]?\\d*).*\\s+" +
                        "Abgabe-Id: (.+)\\s+" +
                        "=============================================\\s+" +
                        "Bewertung:[ ]*(\\d*[.|,]?\\d*).*\\s+" +
                        "=========== Beginn der Kommentare ===========\\s+" +
                        "\\s*((?:(?:(?:[^\\n]*[:|)])\\s*(?:\\d+[,|\\.]\\d+|\\d+)\\/(?:\\d+[,|\\.]\\d+|\\d+))\\s*\\n(?:^(?:\\t+[^\\n]*\\n*))*\\s*)*\\s*)\\s*(?>(.+?)\\s*(?>\\/\\*(.*)\\*\\/)|(.*))\\s*", Pattern.MULTILINE|Pattern.DOTALL);


        String fileContents = fileContentsToString(new File(path),StandardCharsets.UTF_8);

        Matcher matcher = p.matcher(fileContents);

        if(matcher.find()){

            String course = matcher.group(1);
            double maxPoints = extractDoubleFromString(matcher.group(4));
            String sheetName = matcher.group(2);
            String rated_by = matcher.group(3);
            String email = matcher.group(4);
            String submission = matcher.group(5);
            Correction.CorrectionState state;
            double points = 0;
            String note = "";
            String globalComment = "";

            if(!matcher.group(6).trim().equals("")){
                state = Correction.CorrectionState.FINISHED;
                points = extractDoubleFromString(matcher.group(6));
            }else {
                state = Correction.CorrectionState.TODO;
            }

            if(matcher.group(9) != null){
                state = Correction.CorrectionState.MARKED_FOR_LATER;
                note = matcher.group(9);
            }

            if(matcher.group(8) != null){
                globalComment = matcher.group(8);
            } else if(matcher.group(10) != null) {
                globalComment = matcher.group(10);
            }

            String commentSection = matcher.group(7);

            //TODO workaround-> richtige lösung finden
            if(commentSection.equals("\n") || commentSection.trim().length() == 0){
                throw new FileNotInitializedException();
            }

            Exercise e = new Exercise();
            Correction c = new Correction(course, maxPoints, sheetName, rated_by, email, submission, points, path, globalComment, e, state, note);
            e.setCorrection(c);
            parseExercises(commentSection, e);
            c.setExercise(e);
            return c;
        }else{
            throw new ParseRatingFileException(fileContents);
        }
    }

    public static String buildRatingFile(Correction c){
        boolean finished = (c.getState() == Correction.CorrectionState.FINISHED);
        boolean marked = (c.getState() == Correction.CorrectionState.MARKED_FOR_LATER);
        DecimalFormatSymbols dfs = DecimalFormatSymbols.getInstance();
        dfs.setDecimalSeparator('.');
        DecimalFormat format = new DecimalFormat("0.#", dfs);
        String ratingFileContent =
                        "= Bitte nur Bewertung und Kommentare ändern =\n" +
                        "=============================================\n" +
                        "========== Uni2work Bewertungsdatei =========\n" +
                        "======= diese Datei ist UTF8 encodiert ======\n" +
                        "Informationen zum Übungsblatt:\n" +
                        "  Veranstaltung: "+ c.getCourse() + "\n" +
                        "  Blatt: " + c.getSheet().getName() + "\n" +
                        "  Korrektor: " + c.getRated_by() + "\n" +
                        "  Bewertungsschema: Maximal " + format.format(c.getSheet().getGrading().getMax()) + " Punkt(e)\n" +
                        "Abgabe-Id: " + c.getSubmission() + "\n" +
                        "=============================================\n" +
                        "Bewertung: " + ((finished)?format.format(c.getPoints()):"") + "\n" +
                        "=========== Beginn der Kommentare ===========\n";

        if(c.getExercise() != null){
            List<Exercise> list = c.getExercise().getSubExercises().stream().flatMap(Utils::flatten).collect(Collectors.toList());

            for(Exercise e : list){
                ratingFileContent += "\t".repeat(e.getDepth()-1) + e.getName() + " " + format.format(e.getRating()) + "/" + format.format(e.getMaxPoints()) + "\n";
                if(e instanceof ExerciseRating){
                    if(((ExerciseRating) e).getComment() != null && !((ExerciseRating) e).getComment().isEmpty()){
                        ratingFileContent += "\t".repeat(e.getDepth()) + ((ExerciseRating) e).getComment().replace("\n","\n"+"\t".repeat(e.getDepth())) + "\n";
                    }
                }
            }
        }

        if(c.getGlobalComment() != null && c.getGlobalComment().trim().length()>0){
            ratingFileContent += "\n" + c.getGlobalComment().trim() + "\n";
        }

        if(marked){
            ratingFileContent += "/*"+ c.getNote() +"*/\n";
        }

        return ratingFileContent;
    }

    public static double extractDoubleFromString(String s) {
        Pattern pattern = Pattern.compile("(\\d+[.|,]?\\d*)");
        Matcher matcher = pattern.matcher(s);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1).replace(",","."));
        }else{
            return 0;
        }
    }

    public static String formatComment(String s, String replacement){
        //TODO
        //s = s.replaceAll("(\\S+[\\s|\\t]*){10}", "$0"+ replacement);
        s = s.replaceAll("\n",replacement);
        s = s.trim();

        return s;
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

        String nonDelim = str.substring(lastEnd);
        parts.add(lastDelim+nonDelim);

        return parts.toArray(new String[]{});
    }

    public static void initializeComments(Correction c, String init) throws ParseRatingFileException, IOException {
        File file = new File(c.getPath());
        StringBuilder initializedFileContents = new StringBuilder();
        Pattern p = Pattern.compile(
                "(= Bitte nur Bewertung und Kommentare ändern =\\s+" +
                        "=============================================\\s+" +
                        "========== Uni2work Bewertungsdatei =========\\s+" +
                        "======= diese Datei ist UTF8 encodiert ======\\s+" +
                        "Informationen zum Übungsblatt:\\s+" +
                        "  Veranstaltung: (.+)\\s+" +
                        "  Blatt: (.+)\\s+" +
                        "  Korrektor: (.+)\\s+" +
                        "  Bewertung\\w*: (?>Maximal )?(\\d*[.|,]?\\d*).*\\s+" +
                        "Abgabe-Id: (.+)\\s+" +
                        "=============================================\\s+" +
                        "Bewertung:[ ]*(\\d*[.|,]?\\d*).*\\s+" +
                        "=========== Beginn der Kommentare ===========\\s+)", Pattern.MULTILINE);

        String fileContents = fileContentsToString(file, StandardCharsets.UTF_8);
        Matcher matcher = p.matcher(fileContents);

        if(matcher.find()){
            initializedFileContents.append(matcher.group(1)).append(init).append("\n");
            saveContents(file.getPath(), initializedFileContents.toString(), StandardCharsets.UTF_8);
        }else{
            throw new ParseRatingFileException(fileContents);
        }
    }

    public static void saveRatingFile(Correction c) throws IOException {
        saveContents(c.getPath(), buildRatingFile(c), StandardCharsets.UTF_8);
        c.setChanged(false);
    }

    public static void saveContents(String path, String content, Charset charset) throws IOException {
        System.out.println("Saving file: " + path);
        Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(path), charset));
        writer.write(content);
        writer.close();
    }

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

    public static String fileContentsToString(File f, Charset charset) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(new FileInputStream(f), charset));
        StringBuilder res = new StringBuilder();
        String str;
        while ((str = in.readLine()) != null) {
            res.append(str).append("\n");
        }
        in.close();

        return res.toString();
    }

}

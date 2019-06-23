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
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class RatingFileParser {

    public static Correction parseFile(String path) throws ParseRatingFileException, IOException, FileNotInitializedException {

        Pattern p = Pattern.compile(
                "(?m)= Bitte nur Bewertung und Kommentare ändern =\\n" +
                "=============================================\\n" +
                "========== UniWorx Bewertungsdatei ==========\\n" +
                "======= diese Datei ist UTF8 encodiert ======\\n" +
                "Informationen zum Übungsblatt:\\n" +
                "Veranstaltung: (.+)\\n" +
                "Blatt: (.+)\\n" +
                "Korrektor: (.+)\\n" +
                "E-Mail: (.+)\\n" +
                "Abgabe-Id: (.+)\\n" +
                "Maximalpunktzahl: (\\d+[.|,]?\\d*).*\\n" +
                "=============================================\\n" +
                "Bewertung: (\\d*[.|,]?\\d*).*\\n" +
                "=============================================\\n" +
                "Kommentare:\\n" +
                //"\\s*(.*\\w|.*?)\\s*(?>/\\*(.*)\\*/)?\\s*" +
                "\\s*((?:(?:(?:[^\\n]*[:|)])\\s*(?:\\d+[,|\\.]\\d+|\\d+)\\/(?:\\d+[,|\\.]\\d+|\\d+))\\s*\\n(?:^(?:\\t+[^\\t\\n]+\\s*))*)*)\\s*(.*?)\\s*(?>\\/\\*(.*)\\*\\/)?\\s*" +
                "============ Ende der Kommentare ============",Pattern.DOTALL | Pattern.MULTILINE);

        Correction c = new Correction();
        c.setPath(path);

        String fileContents = fileContentsToString(new File(path),StandardCharsets.UTF_8);

        Matcher matcher = p.matcher(fileContents);

        if(matcher.find()){
            c.setLecture(matcher.group(1));
            c.setExerciseSheet(matcher.group(2));
            c.setCorrector(matcher.group(3));
            c.setCorrectorEmail(matcher.group(4));
            c.setId(matcher.group(5));
            c.setMaxPoints(extractDoubleFromString(matcher.group(6)));

            if(!matcher.group(7).trim().equals("")){
                c.setState(Correction.CorrectionState.FINISHED);
                c.setRating(extractDoubleFromString(matcher.group(7)));
            }else {
                c.setState(Correction.CorrectionState.TODO);
            }

            if(matcher.group(10) != null){
                c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
                c.setNote(matcher.group(10));
            }

            if(matcher.group(9) != null){
                c.setGlobalComment(matcher.group(9));
            }

            String commentSection = matcher.group(8);

            //TODO workaround-> richtige lösung finden
            if(commentSection.equals("\n") || commentSection.trim().length() == 0){
                throw new FileNotInitializedException();
            }

            Exercise e = new Exercise();
            e.setCorrection(c);
            parseExercises(commentSection, e);
            c.setExercise(e);

        }else{
            throw new ParseRatingFileException(fileContents);
        }

        return c;
    }

    public static String buildRatingFile(Correction c){
        boolean finished = (c.getState() == Correction.CorrectionState.FINISHED);
        boolean marked = (c.getState() == Correction.CorrectionState.MARKED_FOR_LATER);

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
                "Bewertung: " + ((finished)?format.format(c.getRating()):"") + "\n" +
                "=============================================\n" +
                "Kommentare:\n";


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
            ratingFileContent += c.getGlobalComment() + "\n";
        }

        if(marked){
            ratingFileContent += "/*"+ c.getNote() +"*/\n";
        }

        ratingFileContent += "============ Ende der Kommentare ============\n";

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
                "(= Bitte nur Bewertung und Kommentare ändern =\\n" +
                        "=============================================\\n" +
                        "========== UniWorx Bewertungsdatei ==========\\n" +
                        "======= diese Datei ist UTF8 encodiert ======\\n" +
                        "Informationen zum Übungsblatt:\\n" +
                        "Veranstaltung: .+\\n" +
                        "Blatt: .+\\n" +
                        "Korrektor: .+\\n" +
                        "E-Mail: .+\\n" +
                        "Abgabe-Id: .+\\n" +
                        "Maximalpunktzahl: \\d+[.|,]?\\d*.*\\n" +
                        "=============================================\\n" +
                        "Bewertung: \\d*[.|,]?\\d*.*\\n" +
                        "=============================================\\n" +
                        "Kommentare:\\n)" +
                        ".*\\n*" +
                        "(============ Ende der Kommentare ============)",
                Pattern.DOTALL | Pattern.MULTILINE);

        String fileContents = fileContentsToString(file, StandardCharsets.UTF_8);
        Matcher matcher = p.matcher(fileContents);

        if(matcher.find()){
            initializedFileContents.append(matcher.group(1)).append(init).append("\n").append(matcher.group(2));
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

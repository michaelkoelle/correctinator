package com.koellemichael.utils;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.koellemichael.exceptions.FileNotInitializedException;
import com.koellemichael.exceptions.ParseRatingFileCommentSectionException;
import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;

import java.awt.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class Utils {
    public static Stream<Exercise> flatten(Exercise exercise) {
        if(exercise != null && exercise.getSubExercises() != null){
            return Stream.concat(
                    Stream.of(exercise),
                    exercise.getSubExercises().stream().flatMap(Utils::flatten));
        }else{
            return Stream.of(exercise);
        }
    }

    public static boolean isNewerVersionAvailiable() throws IOException {
        Properties properties = new Properties();
        properties.load(Dialogs.class.getResourceAsStream("/correctinator.properties"));

        String currentVersion = properties.getProperty("version");
        String latestVersion = getLatestVersionNumber();

        String[] latestVersionArray = latestVersion.split("\\.");
        String[] currentVersionArray = currentVersion.split("\\.");

        if(latestVersionArray.length==3 && currentVersionArray.length==3){
            int latestMajor = Integer.parseInt(latestVersionArray[0]);
            int latestMinor = Integer.parseInt(latestVersionArray[1]);
            int latestPatch = Integer.parseInt(latestVersionArray[2]);

            int currentMajor = Integer.parseInt(currentVersionArray[0]);
            int currentMinor = Integer.parseInt(currentVersionArray[1]);
            int currentPatch = Integer.parseInt(currentVersionArray[2]);

            if(latestMajor>currentMajor){
                return true;
            }
            if(latestMajor==currentMajor && latestMinor>currentMinor){
                return true;
            }
            if(latestMajor==currentMajor && latestMinor==currentMinor && latestPatch>currentPatch){
                return true;
            }
            return false;
        }else{
            throw new IOException();
        }
    }

    public static String getLatestVersionNumber() throws IOException {
        String url = "https://api.github.com/repos/koellemichael/correctinator/releases/latest";

        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        con.setRequestMethod("GET");

        if(con.getResponseCode() != 200){
            throw new IOException();
        }

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        //Parse JSON
        JsonParser parser = new JsonParser();
        JsonElement element = parser.parse(response.toString());
        JsonObject jsonObject = element.getAsJsonObject();

        return jsonObject.get("tag_name").getAsString();
    }

    public static void openWebsite(String url){
        if(Desktop.isDesktopSupported()){
            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(new URI(url));
            } catch (IOException | URISyntaxException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }else{
            Runtime runtime = Runtime.getRuntime();
            try {
                runtime.exec("xdg-open " + url);
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

    public static boolean isInteger(String i){
        return i.matches("\\d+");
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
}

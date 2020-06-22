package com.koellemichael.utils;

import com.koellemichael.exceptions.FileNotInitializedException;
import com.koellemichael.exceptions.ParseRatingFileException;
import com.koellemichael.model.*;
import org.yaml.snakeyaml.TypeDescription;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.koellemichael.utils.Utils.parseExercises;

public class Uni2WorkYAMLParser implements RatingFileParser {

    public static Correction parseFile(String path) throws ParseRatingFileException, IOException, FileNotInitializedException {
        //https://regex101.com/r/TwuLi3/8
        Pattern p = Pattern.compile("(?<yaml>.*)\\.\\.\\.\\s+\\s*(?<ex>(?:(?:(?:[^\\n]*[:|)])\\s*(?:\\d+[,|\\.]\\d+|\\d+)\\/(?:\\d+[,|\\.]\\d+|\\d+))\\s*\\n(?:^(?:\\t+[^\\t\\n]+\\n*))*\\s*)*\\s*)\\s*(?>(?<global>.+?)\\s*(?>\\/\\*(?<note>.*)\\*\\/)|(?>\\s*(?>\\/\\*(?<note1>.*)\\*\\/)|(?<global1>.*)))\\s*", Pattern.MULTILINE|Pattern.DOTALL);
        String fileContents = Utils.fileContentsToString(new File(path), StandardCharsets.UTF_8);

        Matcher matcher = p.matcher(fileContents);
        String globalComment = "";
        String note = "";
        Correction.CorrectionState state = Correction.CorrectionState.TODO;

        if(matcher.find()){

            String commentSection = matcher.group("ex");

            //TODO workaround-> richtige lösung finden
            if(commentSection.equals("\n") || commentSection.trim().length() == 0){
                throw new FileNotInitializedException();
            }

            if(matcher.group("global") != null){
                globalComment = matcher.group("global");
            } else if(matcher.group("global1") != null) {
                globalComment = matcher.group("global1");
            }

            if(matcher.group("note") != null){
                state = Correction.CorrectionState.MARKED_FOR_LATER;
                note = matcher.group("note");
            }else if(matcher.group("note1") != null){
                state = Correction.CorrectionState.MARKED_FOR_LATER;
                note = matcher.group("note1");
            }

            Constructor constructor = new Constructor(Submission.class);
            TypeDescription correctionTypeDescription = new TypeDescription(Submission.class);
            correctionTypeDescription.addPropertyParameters("sheet", Sheet1.class);
            correctionTypeDescription.addPropertyParameters("grading", Grading1.class);
            constructor.addTypeDescription(correctionTypeDescription);

            Yaml yaml = new Yaml(constructor);
            String yamlContent = matcher.group("yaml");
            Submission s = yaml.loadAs(yamlContent, Submission.class);


            if(s.getRating_done()){
                state = Correction.CorrectionState.FINISHED;
            }

            Exercise e = new Exercise();
            Sheet sheet = new Sheet(s.getSheet().name, s.getSheet().type, new Grading(s.getSheet().getGrading().max, s.getSheet().getGrading().type));

            Correction correction = new Correction(s.getTerm(),s.getSchool(),s.getCourse(), sheet,s.getRated_by(),s.getRated_at(),s.getSubmission(),s.getPoints(),s.getRating_done(),path, globalComment, e, false, state, note);
            e.setCorrection(correction);
            parseExercises(commentSection, e);
            correction.setExercise(e);

            return correction;
        }else{
            throw new ParseRatingFileException(fileContents);
        }
    }

    public static void saveRatingFile(Correction c) throws IOException {
        saveContents(c.getPath(), buildRatingFileYAML(c), StandardCharsets.UTF_8);
        c.setChanged(false);
    }

    private static String buildRatingFileYAML(Correction c) {

        Submission submission = new Submission(c.getTerm(), c.getSchool(), c.getCourse(), new Sheet1(c.getSheet().getName(), c.getSheet().getType(), new Grading1(c.getSheet().getGrading().getMax(), c.getSheet().getGrading().getType())),c.getRated_by(),c.getRated_at(),c.getSubmission(),c.getPoints(),c.isRating_done());

        Yaml yaml = new Yaml();
        StringWriter writer = new StringWriter();
        yaml.dump(submission, writer);

        DecimalFormatSymbols dfs = DecimalFormatSymbols.getInstance();
        dfs.setDecimalSeparator('.');
        DecimalFormat format = new DecimalFormat("0.#", dfs);

        String ratingFileContent = writer.toString().replace("!!com.koellemichael.model.Submission\n", "%YAML 1.2\n" + "---\n") +  "\n...\n";


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

        if(c.getState() == Correction.CorrectionState.MARKED_FOR_LATER){
            ratingFileContent += "/*"+ c.getNote() +"*/\n";
        }

        return ratingFileContent;
    }

    public static void saveContents(String path, String content, Charset charset) throws IOException {
        System.out.println("Saving file: " + path);
        Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(path), charset));
        writer.write(content);
        writer.close();
    }

    public static void initializeComments(Correction c, String init) throws ParseRatingFileException, IOException, FileNotInitializedException {
        Pattern p = Pattern.compile("(?<yaml>.*)\\.\\.\\.\\s+", Pattern.MULTILINE|Pattern.DOTALL);

        String fileContents = Utils.fileContentsToString(new File(c.getPath()), StandardCharsets.UTF_8);

        Matcher matcher = p.matcher(fileContents);

        if(matcher.find()){
            if(matcher.group("yaml") != null){
                String yaml = matcher.group("yaml");
                String content = yaml + "\n...\n" + init + "\n";
                saveContents(c.getPath(),content,StandardCharsets.UTF_8);
            }
        }
    }



}

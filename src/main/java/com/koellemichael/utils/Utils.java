package com.koellemichael.utils;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.koellemichael.model.Exercise;

import java.awt.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Properties;
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
}

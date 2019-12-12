package com.koellemichael;

import com.koellemichael.controller.Controller;
import com.koellemichael.utils.Dialogs;
import com.koellemichael.utils.Utils;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Screen;
import javafx.stage.Stage;

import java.util.Properties;

public class App extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        primaryStage.setTitle("Correctinator");

        Rectangle2D primaryScreenBounds = Screen.getPrimary().getVisualBounds();
        double width = primaryScreenBounds.getWidth() / 1.2;
        double height = primaryScreenBounds.getHeight() / 1.2;

        FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/main.fxml"));
        Parent root = loader.load();
        Controller controller = loader.getController();
        controller.initialize(primaryStage);


        primaryStage.setFullScreenExitHint("F1 um Vollbild zu verlassen");
        primaryStage.setScene(new Scene(root, width, height));
        primaryStage.show();

        Properties properties = new Properties();
        properties.load(getClass().getResourceAsStream("/correctinator.properties"));
        String currentVersion = properties.getProperty("version");
        primaryStage.setTitle("Correctinator v" + currentVersion);

        try{
            if(Utils.isNewerVersionAvailiable()){
                Dialogs.showNewerVersionAvailableDialog();
            }
        } catch (Exception e){

        }
    }


    public static void main(String[] args) {
        launch(args);
    }
}
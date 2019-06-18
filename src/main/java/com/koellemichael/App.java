package com.koellemichael;

import com.koellemichael.controller.Controller;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class App extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception{
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/sample.fxml"));
        Parent root = loader.load();
        Controller controller = loader.getController();
        controller.initialize(primaryStage);

        primaryStage.setTitle("Correctinator");
        primaryStage.setScene(new Scene(root, 1300, 800));
        primaryStage.show();
    }


    public static void main(String[] args) {
        launch(args);
    }
}
package com.koellemichael.utils;

import javafx.scene.control.Alert;
import javafx.scene.control.Hyperlink;

import java.io.IOException;
import java.util.Properties;

public class Dialogs {
    public static void showNewerVersionAvailableDialog() throws IOException {
        Properties properties = new Properties();
        properties.load(Dialogs.class.getResourceAsStream("/correctinator.properties"));
        String currentVersion = properties.getProperty("version");
        String latestVersion = Utils.getLatestVersionNumber();
        String url = "https://github.com/koellemichael/correctinator/releases/latest";
        Hyperlink hyperlink = new Hyperlink();
        hyperlink.setText(url);
        hyperlink.setOnAction(e -> Utils.openWebsite(url));
        Alert dialog = new Alert(Alert.AlertType.INFORMATION);
        dialog.setTitle("Neuere Version verfügbar!");
        dialog.setHeaderText("Es ist eine neuere Correctinator Version " + currentVersion + " --> " + latestVersion + " verfügbar!");
        dialog.getDialogPane().setContent(hyperlink);
        dialog.showAndWait();
    }

    public static void showNoNewerVersionAvailableDialog(){
        Alert dialog = new Alert(Alert.AlertType.INFORMATION);
        dialog.setTitle("Keine neuere Version verfügbar!");
        dialog.setHeaderText(null);
        dialog.setContentText("Correctinator ist auf dem neusten Stand!");
        dialog.showAndWait();
    }
}

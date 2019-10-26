package com.koellemichael.controller;

import com.koellemichael.utils.PreferenceKeys;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker;
import javafx.scene.control.Alert;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Base64;
import java.util.Locale;
import java.util.prefs.Preferences;

public class PDFViewController implements ChangeListener {

    public WebView web_pdf;
    private WebEngine engine;
    private File pdf;
    private Preferences preferences;

    public void initialize(File pdf){
        this.pdf = pdf;
        engine = web_pdf.getEngine();

        engine.setJavaScriptEnabled(true);
        engine.setUserStyleSheetLocation(getClass().getResource("/pdfviewer/web/viewer.css").toExternalForm());
        engine.load(getClass().getResource("/pdfviewer/web/viewer.html").toExternalForm());
        engine.getLoadWorker().stateProperty().addListener(this);

        preferences = Preferences.userRoot();
    }

    private void loadPDF(File pdf){
        Platform.runLater(() -> {
            try {
                byte[] data = Files.readAllBytes(Paths.get(pdf.getAbsolutePath()));
                String base64 = Base64.getEncoder().encodeToString(data);
                engine.executeScript("openFileFromBase64('" + base64 + "')");

                if(preferences.getBoolean(PreferenceKeys.VERBOSE_PREF,false)){
                    Alert deb = new Alert(Alert.AlertType.INFORMATION);
                    deb.setTitle("DEBUG");
                    deb.setHeaderText(null);
                    String sb = "Absoluter PDF Pfad: " + pdf.getAbsolutePath() + "\n" +
                                "Relativer PDF Pfad: " + pdf.getPath() + "\n" +
                                "Paths: " + Paths.get(pdf.getAbsolutePath()) + "\n";
                    deb.setContentText(sb);
                    deb.showAndWait();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void changeLanguage(Locale locale) {
        web_pdf.getEngine().executeScript("changeLanguage('" + locale.toLanguageTag() + "')");
    }

    @Override
    public void changed(ObservableValue observableValue, Object oldValue, Object newValue) {
        if (newValue == Worker.State.SUCCEEDED) {
            changeLanguage(Locale.GERMAN);
            loadPDF(pdf);
        }
    }
}

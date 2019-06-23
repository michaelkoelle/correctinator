package com.koellemichael.controller;

import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Locale;

public class PDFViewController implements ChangeListener {

    public WebView web_pdf;
    private WebEngine engine;
    private File pdf;

    public void initialize(File pdf){
        this.pdf = pdf;
        engine = web_pdf.getEngine();

        engine.setJavaScriptEnabled(true);
        engine.setUserStyleSheetLocation(getClass().getResource("/pdfviewer/web/viewer.css").toExternalForm());
        engine.load(getClass().getResource("/pdfviewer/web/viewer.html").toExternalForm());
        engine.getLoadWorker().stateProperty().addListener(this);
    }

    private void loadPDF(File pdf){
        try {
            byte[] data = Files.readAllBytes(Paths.get(pdf.getPath()));
            String base64 = Base64.getEncoder().encodeToString(data);
            Platform.runLater(() -> engine.executeScript("openFileFromBase64('" + base64 + "')"));

        } catch (Exception e) {
            e.printStackTrace();
        }
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

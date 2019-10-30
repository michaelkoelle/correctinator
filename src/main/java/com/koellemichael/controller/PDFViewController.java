package com.koellemichael.controller;
import netscape.javascript.JSObject;

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
    private final JavaBridge bridge = new JavaBridge();


    public void initialize(File pdf){
        this.pdf = pdf;
        engine = web_pdf.getEngine();

        engine.setJavaScriptEnabled(true);
        engine.setUserStyleSheetLocation(getClass().getResource("/pdfviewer/web/viewer.css").toExternalForm());
        engine.getLoadWorker().stateProperty().addListener(this);
        engine.load(getClass().getResource("/pdfviewer/web/viewer.html").toExternalForm());
        engine.getLoadWorker().stateProperty().addListener((observable, oldValue, newValue) ->
        {
            JSObject window = (JSObject) engine.executeScript("window");
            window.setMember("java", bridge);
            engine.executeScript("console.log = function(message)\n" +
                    "{\n" +
                    "    java.log(message);\n" +
                    "};");
        });

    }

    private void loadPDF(File pdf){
        try {
            byte[] data = Files.readAllBytes(Paths.get(pdf.getAbsolutePath()));
            String base64 = Base64.getEncoder().encodeToString(data);
            engine.executeScript("openFileFromBase64('" + base64 + "')");
            System.out.println("LOAD PDF: " + pdf.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private void changeLanguage(Locale locale) {
        web_pdf.getEngine().executeScript("changeLanguage('" + locale.toLanguageTag() + "')");
    }

    @Override
    public void changed(ObservableValue observableValue, Object oldValue, Object newValue) {
        System.out.println(newValue);
        if (newValue == Worker.State.SUCCEEDED) {
            changeLanguage(Locale.GERMAN);
            loadPDF(pdf);
        }
    }


    public class JavaBridge
    {
        public void log(String text)
        {
            System.out.println(text);
        }
    }

}

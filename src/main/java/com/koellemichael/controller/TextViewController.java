package com.koellemichael.controller;

import javafx.scene.layout.StackPane;
import javafx.scene.web.WebView;

import java.net.MalformedURLException;

public class TextViewController {

    public StackPane pane;
    public WebView web_text;

    public void initialize(String content, String mimeType) throws MalformedURLException {
        web_text.getEngine().loadContent(content,mimeType);
    }
}

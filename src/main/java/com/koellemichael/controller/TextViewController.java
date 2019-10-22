package com.koellemichael.controller;

import com.koellemichael.utils.PreferenceKeys;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Text;
import javafx.scene.text.TextFlow;
import javafx.scene.web.WebView;

import javax.swing.text.rtf.RTFEditorKit;
import java.net.MalformedURLException;
import java.util.prefs.PreferenceChangeEvent;
import java.util.prefs.PreferenceChangeListener;
import java.util.prefs.Preferences;

public class TextViewController {

    public StackPane pane;
    public WebView web_text;
    private Preferences preferences;

    public void initialize(String content, String mimeType) throws MalformedURLException {
        preferences = Preferences.userRoot();
        web_text.getEngine().loadContent(content.replace("\n","<br>"),"text/html");


        if(preferences.getBoolean(PreferenceKeys.WRAP_TEXT_PREF,false)){
            web_text.getEngine().setUserStyleSheetLocation(String.valueOf(getClass().getResource("/stylesheets/textviewer.css")));
        }else{
            web_text.getEngine().setUserStyleSheetLocation(String.valueOf(getClass().getResource("/stylesheets/textviewer_nowrap.css")));

        }

    }
}

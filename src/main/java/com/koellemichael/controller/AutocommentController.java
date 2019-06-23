package com.koellemichael.controller;

import com.koellemichael.model.Correction;
import com.koellemichael.utils.PreferenceKeys;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.prefs.Preferences;

public class AutocommentController {
    public TextField ti_100;
    public TextField ti_80;
    public TextField ti_60;
    public TextField ti_40;
    public TextField ti_20;
    public TextField ti_0;

    private Preferences preferences;
    private ObservableList<Correction> corrections;
    private Stage s;

    public void initialize(Stage s, ObservableList<Correction> corrections){
        this.s = s;
        this.corrections = corrections;
        this.preferences = Preferences.userRoot();
        ti_0.setText(preferences.get(PreferenceKeys.COMMENT_0_PREF, ""));
        ti_20.setText(preferences.get(PreferenceKeys.COMMENT_20_PREF, ""));
        ti_40.setText(preferences.get(PreferenceKeys.COMMENT_40_PREF, ""));
        ti_60.setText(preferences.get(PreferenceKeys.COMMENT_60_PREF, "Gut!"));
        ti_80.setText(preferences.get(PreferenceKeys.COMMENT_80_PREF, "Sehr gut!"));
        ti_100.setText(preferences.get(PreferenceKeys.COMMENT_100_PREF, "Perfekt!"));
    }

    public void onDone(ActionEvent actionEvent) {
        ArrayList oldValues = new ArrayList();

        oldValues.add(preferences.get(PreferenceKeys.COMMENT_0_PREF, ""));
        oldValues.add(preferences.get(PreferenceKeys.COMMENT_20_PREF, ""));
        oldValues.add(preferences.get(PreferenceKeys.COMMENT_40_PREF, ""));
        oldValues.add(preferences.get(PreferenceKeys.COMMENT_60_PREF, "Gut!"));
        oldValues.add(preferences.get(PreferenceKeys.COMMENT_80_PREF, "Sehr gut!"));
        oldValues.add(preferences.get(PreferenceKeys.COMMENT_100_PREF, "Perfekt!"));

        preferences.put(PreferenceKeys.COMMENT_0_PREF, ti_0.getText());
        preferences.put(PreferenceKeys.COMMENT_20_PREF, ti_20.getText());
        preferences.put(PreferenceKeys.COMMENT_40_PREF, ti_40.getText());
        preferences.put(PreferenceKeys.COMMENT_60_PREF, ti_60.getText());
        preferences.put(PreferenceKeys.COMMENT_80_PREF, ti_80.getText());
        preferences.put(PreferenceKeys.COMMENT_100_PREF, ti_100.getText());

        corrections.forEach(c -> c.setGlobalComment(replaceOld(oldValues, c.getGlobalComment())));
        s.close();
    }

    private String replaceOld(ArrayList<String> old,String comment){

        if(comment.contains(old.get(0))){
            comment = comment.replace(old.get(0), preferences.get(PreferenceKeys.COMMENT_0_PREF, ""));
        }

        if(comment.contains(old.get(1))){
            comment = comment.replace(old.get(1), preferences.get(PreferenceKeys.COMMENT_20_PREF, ""));
        }

        if(comment.contains(old.get(2))){
            comment = comment.replace(old.get(2), preferences.get(PreferenceKeys.COMMENT_40_PREF, ""));
        }

        if(comment.contains(old.get(3))){
            comment = comment.replace(old.get(3), preferences.get(PreferenceKeys.COMMENT_60_PREF, "Gut!"));
        }

        if(comment.contains(old.get(4))){
            comment = comment.replace(old.get(4), preferences.get(PreferenceKeys.COMMENT_80_PREF, "Sehr gut!"));
        }

        if(comment.contains(old.get(5))){
            comment = comment.replace(old.get(5), preferences.get(PreferenceKeys.COMMENT_100_PREF, "Perfekt!"));
        }

        return comment;
    }
}

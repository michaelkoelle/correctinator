package com.koellemichael.utils;

import com.koellemichael.model.Correction;

import java.util.ArrayList;
import java.util.Optional;
import java.util.prefs.Preferences;

public class AutocommentUtils {

    public static String buildAutoComment(Correction c){
        Preferences preferences = Preferences.userRoot();
        double percentage = (c.getRating()/c.getMaxPoints())*100;

        if (percentage >= 100) {
            return preferences.get(PreferenceKeys.COMMENT_100_PREF,"Perfekt!");
        } else if (percentage > 80) {
            return preferences.get(PreferenceKeys.COMMENT_80_PREF,"Sehr gut!");
        } else if (percentage > 60) {
            return preferences.get(PreferenceKeys.COMMENT_60_PREF,"Gut!");
        } else if (percentage > 40) {
            return preferences.get(PreferenceKeys.COMMENT_40_PREF,"");
        } else if (percentage > 20) {
            return preferences.get(PreferenceKeys.COMMENT_20_PREF,"");
        } else if (percentage >= 0) {
            return preferences.get(PreferenceKeys.COMMENT_0_PREF,"");
        }

        return "";
    }

    public static String replaceAutoCommentWithString(String comment, String replacement){
        Preferences preferences = Preferences.userRoot();

        ArrayList<String> targets = new ArrayList<>();

        targets.add(preferences.get(PreferenceKeys.COMMENT_100_PREF, "Perfekt!"));
        targets.add(preferences.get(PreferenceKeys.COMMENT_80_PREF, "Sehr gut!"));
        targets.add(preferences.get(PreferenceKeys.COMMENT_60_PREF, "Gut!"));
        targets.add(preferences.get(PreferenceKeys.COMMENT_40_PREF, ""));
        targets.add(preferences.get(PreferenceKeys.COMMENT_20_PREF, ""));
        targets.add(preferences.get(PreferenceKeys.COMMENT_0_PREF, ""));

        Optional<String> res = targets.stream().filter(s -> (comment.contains(s) && !s.trim().equals(""))).findFirst();

        if(res.isPresent()){
            return comment.replace(res.get(), replacement);
        }else{
            if(!comment.trim().equals("")){
                return comment + "\n" + replacement;
            }else{
                return replacement;
            }

        }
    }
}

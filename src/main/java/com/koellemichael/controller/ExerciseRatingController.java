package com.koellemichael.controller;

import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.PreferenceKeys;
import com.koellemichael.utils.RatingFileParser;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ObjectProperty;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.ActionEvent;
import javafx.scene.control.Label;
import javafx.scene.control.Spinner;
import javafx.scene.control.SpinnerValueFactory;
import javafx.scene.control.TextArea;

import java.io.IOException;
import java.util.prefs.Preferences;

public class ExerciseRatingController implements ChangeListener {

    public Label lbl_exercise_name;
    public Spinner<Double> sp_rating;
    public Label lbl_max_points;
    public TextArea ta_comments;
    private ExerciseRating e;

    private ObjectProperty<Double> spinnerValue;

    public void initialize(ExerciseRating e) {
        this.e = e;
        lbl_max_points.textProperty().bind(Bindings.convert(e.maxPointsProperty()));
        lbl_exercise_name.textProperty().bind(e.nameProperty());

        SpinnerValueFactory<Double> valueFactory = new SpinnerValueFactory.DoubleSpinnerValueFactory(0,e.getMaxPoints(), e.getRating(), 0.5);
        sp_rating.setValueFactory(valueFactory);
        spinnerValue = e.ratingProperty().asObject();
        sp_rating.getValueFactory().valueProperty().bindBidirectional(spinnerValue);

        ta_comments.textProperty().bindBidirectional(e.commentProperty());

        //TODO falls die listener weg sind funktioniert das binding nicht mehr richtig weil .asObject vom gc entfernt wird
        e.ratingProperty().addListener(this);
        e.commentProperty().addListener(this);
    }


    @Override
    public void changed(ObservableValue observable, Object oldValue, Object newValue) {
        e.changed();

        Preferences pref = Preferences.userRoot();
        if(pref.getBoolean(PreferenceKeys.AUTOSAVE_PREF, false)){
            try {
                RatingFileParser.saveRatingFile(e.getCorrection());
            } catch (IOException ignored) {}
        }
    }

    public void onSetMaxPoints(ActionEvent actionEvent) {
        if(e.getComment().equals("fehlt")){
            e.setComment("");
        }
        e.setRating(e.getMaxPoints());
    }

    public void onMissingSolution(ActionEvent actionEvent) {
        e.setRating(0);
        e.setComment("fehlt");
    }
}

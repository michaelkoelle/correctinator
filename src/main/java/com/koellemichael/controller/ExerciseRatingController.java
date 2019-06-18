package com.koellemichael.controller;

import com.koellemichael.model.ExerciseRating;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ObjectProperty;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.scene.control.Label;
import javafx.scene.control.Spinner;
import javafx.scene.control.SpinnerValueFactory;
import javafx.scene.control.TextArea;

public class ExerciseRatingController implements ChangeListener{

    public Label lbl_exercise_name;
    public Spinner<Double> sp_rating;
    public Label lbl_max_points;
    public TextArea ta_comments;

    private ObjectProperty<Double> spinnerValue;

    public void initialize(ExerciseRating e) {

        lbl_max_points.textProperty().bind(Bindings.convert(e.maxPointsProperty()));
        lbl_exercise_name.textProperty().bind(e.nameProperty());

        SpinnerValueFactory<Double> valueFactory = new SpinnerValueFactory.DoubleSpinnerValueFactory(0,e.getMaxPoints(), e.getRating(), 0.5);
        sp_rating.setValueFactory(valueFactory);
        spinnerValue = e.ratingProperty().asObject();
        sp_rating.getValueFactory().valueProperty().bindBidirectional(spinnerValue);

        ta_comments.textProperty().bindBidirectional(e.commentProperty());

        e.ratingProperty().addListener(this);
        e.commentProperty().addListener(this);
    }

    @Override
    public void changed(ObservableValue observableValue, Object oldVal, Object newVal) {
        //e.setChanged();
        //RatingFileParser.saveRatingFile(e.getCorrection());
    }


}

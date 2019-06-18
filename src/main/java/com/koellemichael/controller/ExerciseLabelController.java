package com.koellemichael.controller;

import com.koellemichael.model.Exercise;
import javafx.beans.binding.Bindings;
import javafx.scene.control.Label;

public class ExerciseLabelController {

    public Label lbl_exercise_name;
    public Label lbl_points;
    public Label lbl_max_points;

    public void initialize(Exercise exercise){
        lbl_max_points.textProperty().bind(Bindings.convert(exercise.maxPointsProperty()));
        lbl_exercise_name.textProperty().bind(exercise.nameProperty());
        lbl_points.textProperty().bind(Bindings.convert(exercise.ratingProperty()));
    }
}

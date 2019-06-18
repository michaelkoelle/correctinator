package com.koellemichael.controller;

import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.scene.control.Label;
import java.util.stream.DoubleStream;

public class ExerciseLabelController {

    public Label lbl_exercise_name;
    public Label lbl_points;
    public Label lbl_max_points;

    public void initialize(Exercise exercise){

        DoubleBinding maxPointsBinding = Bindings.createDoubleBinding(() -> exercise.getSubExercises().stream().flatMapToDouble(e -> {
            if(e instanceof ExerciseRating) {
                return DoubleStream.of(((ExerciseRating) e).getMaxPoints());
            } else {
                return DoubleStream.of(0);
            }
        }).sum(),exercise.getSubExercises());

        lbl_max_points.textProperty().bind(Bindings.convert(maxPointsBinding));
        lbl_exercise_name.textProperty().bind(exercise.nameProperty());

        DoubleBinding ratingBinding = Bindings.createDoubleBinding(() -> exercise.getSubExercises().stream().flatMapToDouble(e -> {
            if(e instanceof ExerciseRating) {
                return DoubleStream.of(((ExerciseRating) e).getRating());
            } else {
                return DoubleStream.of(0);
            }
        }).sum(), exercise.getSubExercises());

        lbl_points.textProperty().bind(Bindings.convert(ratingBinding));
    }
}

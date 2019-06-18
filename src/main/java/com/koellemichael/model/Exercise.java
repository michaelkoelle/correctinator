package com.koellemichael.model;

import javafx.beans.Observable;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.util.Callback;

public class Exercise {
    private SimpleListProperty<Exercise> subExercises;
    private SimpleStringProperty name;
    private Exercise parent;

    public Exercise() {
        this.name = new SimpleStringProperty("");
        this.parent = null;
        this.subExercises = new SimpleListProperty<>(FXCollections.observableArrayList(extractor()));
    }

    public static Callback<Exercise, Observable[]> extractor() {
        return (Exercise e) -> {
            if(e instanceof ExerciseRating){
                return new Observable[] {
                        ((ExerciseRating)e).ratingProperty(),
                        ((ExerciseRating)e).maxPointsProperty(),
                        ((ExerciseRating)e).commentProperty(),
                        e.nameProperty(),
                        e.subExercisesProperty(),
                };
            }else{
                return new Observable[] {
                        e.nameProperty(),
                        e.subExercisesProperty(),
                };
            }
        };
    }

    public Exercise(String name, Exercise parent) {
        this.name = new SimpleStringProperty(name);
        this.parent = parent;
        this.subExercises = new SimpleListProperty<>(FXCollections.observableArrayList(extractor()));
    }

    public void addSubExercise(Exercise e){
        subExercises.get().add(e);
    }

    public ObservableList<Exercise> getSubExercises() {
        return subExercises.get();
    }

    public SimpleListProperty<Exercise> subExercisesProperty() {
        return subExercises;
    }

    public void setSubExercises(ObservableList<Exercise> subExercises) {
        this.subExercises.set(subExercises);
    }

    public Exercise getParent() {
        return parent;
    }
    public void setParent(Exercise parent) {
        this.parent = parent;
    }

    public String getName() {
        return name.get();
    }
    public SimpleStringProperty nameProperty() {
        return name;
    }
    public void setName(String name) {
        this.name.set(name);
    }
}

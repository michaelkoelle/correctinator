package com.koellemichael.model;

import com.koellemichael.utils.Utils;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.beans.property.ReadOnlyDoubleProperty;
import javafx.beans.property.ReadOnlyDoubleWrapper;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.util.Callback;

public class Exercise {
    private SimpleListProperty<Exercise> subExercises;
    private SimpleStringProperty name;
    private Exercise parent;
    private ReadOnlyDoubleWrapper rating;
    private ReadOnlyDoubleWrapper maxPoints;
    private Correction correction;

    public Exercise() {
        this.name = new SimpleStringProperty("");
        this.parent = null;
        this.subExercises = new SimpleListProperty<>(FXCollections.observableArrayList(extractor()));
        this.rating = new ReadOnlyDoubleWrapper();
        this.maxPoints = new ReadOnlyDoubleWrapper();
        this.correction = null;
        this.subExercises.addListener((observable, oldValue, newValue) -> {
            if(getSubExercises() != null){
                initRatingBinding();
                initMaxPointsBinding();
            }
        });
        initRatingBinding();
        initMaxPointsBinding();
    }

    public Exercise(String name, Exercise parent) {
        this.name = new SimpleStringProperty(name);
        this.parent = parent;
        this.subExercises = new SimpleListProperty<>(FXCollections.observableArrayList(extractor()));
        this.rating = new ReadOnlyDoubleWrapper();
        this.maxPoints = new ReadOnlyDoubleWrapper();
        this.correction = parent.correction;
        this.subExercises.addListener((observable, oldValue, newValue) -> {
            if(getSubExercises() != null){
                initRatingBinding();
                initMaxPointsBinding();
            }
        });
        initRatingBinding();
        initMaxPointsBinding();
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
                        e.ratingProperty(),
                        e.maxPointsProperty(),
                };
            }
        };
    }

    public int getDepth(){
        int depth = 0;
        Exercise p = getParent();
        while(p != null){
            p = p.getParent();
            depth++;
        }
        return depth;
    }

    public void initRatingBinding(){
        DoubleBinding ratingBinding = Bindings.createDoubleBinding(() -> this.getSubExercises().stream().flatMap(Utils::flatten).mapToDouble(e -> {
            if(e instanceof ExerciseRating) {
                return ((ExerciseRating) e).getRating();
            } else {
                return 0;
            }
        }).sum(), this.getSubExercises());

        rating.bind(ratingBinding);
    }

    public void initMaxPointsBinding(){
        DoubleBinding maxPointsBinding = Bindings.createDoubleBinding(() -> this.getSubExercises().stream().flatMap(Utils::flatten).mapToDouble(e -> {
            if(e instanceof ExerciseRating) {
                return ((ExerciseRating) e).getMaxPoints();
            } else {
                return 0;
            }
        }).sum(), this.getSubExercises());

        maxPoints.bind(maxPointsBinding);
    }

    public double getRating(){
        return rating.get();
    }

    public ReadOnlyDoubleProperty ratingProperty(){
        return rating.getReadOnlyProperty();
    }

    public double getMaxPoints() {
        return maxPoints.get();
    }

    public ReadOnlyDoubleProperty maxPointsProperty() {
        return maxPoints.getReadOnlyProperty();
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

    public void setCorrection(Correction correction) {
        this.correction = correction;
    }

    public Correction getCorrection() {
        return correction;
    }

    public void changed(){
        this.correction.setChanged(true);
    }
}

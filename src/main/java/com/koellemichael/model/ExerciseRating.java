package com.koellemichael.model;

import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.property.SimpleStringProperty;

public class ExerciseRating extends Exercise {
    private SimpleDoubleProperty maxPoints;
    private SimpleStringProperty comment;
    private SimpleDoubleProperty rating;
    private boolean autoGen = false;

    public ExerciseRating(String name, Exercise parent) {
        super(name, parent);
        this.maxPoints = new SimpleDoubleProperty(0);
        this.comment = new SimpleStringProperty("");
        this.rating = new SimpleDoubleProperty(0);
        setSubExercises(null);
    }

    public ExerciseRating() {
        super();
        this.maxPoints = new SimpleDoubleProperty(0);
        this.comment = new SimpleStringProperty("");
        this.rating = new SimpleDoubleProperty(0);
        setSubExercises(null);
    }

    public double getMaxPoints() {
        return maxPoints.get();
    }

    public SimpleDoubleProperty maxPointsProperty() {
        return maxPoints;
    }

    public void setMaxPoints(double maxPoints) {
        this.maxPoints.set(maxPoints);
    }

    public double getRating() {
        return rating.get();
    }

    public void setRating(double rating) {
        this.rating.set(rating);
    }

    public SimpleDoubleProperty ratingProperty() {
        return rating;
    }

    public String getComment() {
        return comment.get();
    }

    public SimpleStringProperty commentProperty() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment.set(comment);
    }

    public boolean isAutoGen() {
        return autoGen;
    }

    public void setAutoGen(boolean autoGen) {
        this.autoGen = autoGen;
    }
}

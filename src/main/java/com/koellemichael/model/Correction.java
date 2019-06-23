package com.koellemichael.model;

import com.koellemichael.utils.Utils;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.beans.property.*;

public class Correction {

    public enum CorrectionState {TODO, MARKED_FOR_LATER, FINISHED, NOT_INITIALIZED, PARSE_ERROR};

    private SimpleStringProperty id;
    private SimpleStringProperty path;
    private SimpleStringProperty lecture;
    private SimpleStringProperty exerciseSheet;
    private SimpleStringProperty corrector;
    private SimpleStringProperty correctorEmail;
    private SimpleDoubleProperty maxPoints;
    private SimpleObjectProperty<Exercise> exercise;
    private SimpleBooleanProperty changed;
    private SimpleObjectProperty<CorrectionState> state;
    private SimpleStringProperty note;
    private ReadOnlyDoubleWrapper rating;

    public Correction() {
        this.id = new SimpleStringProperty("");
        this.path = new SimpleStringProperty("");
        this.lecture = new SimpleStringProperty("");
        this.exerciseSheet = new SimpleStringProperty("");
        this.corrector = new SimpleStringProperty("");
        this.correctorEmail = new SimpleStringProperty("");
        this.maxPoints = new SimpleDoubleProperty(0);
        this.exercise = new SimpleObjectProperty<>();
        this.changed = new SimpleBooleanProperty(false);
        this.note = new SimpleStringProperty("");
        this.state = new SimpleObjectProperty<>(CorrectionState.TODO);
        this.rating = new ReadOnlyDoubleWrapper();
    }

    public void initRatingBinding(){
        DoubleBinding ratingBinding = Bindings.createDoubleBinding(() -> this.getExercise().getSubExercises().stream().flatMap(Utils::flatten).mapToDouble(e -> {
            if(e instanceof ExerciseRating) {
                return ((ExerciseRating) e).getRating();
            } else {
                return 0;
            }
        }).sum(), this.getExercise().getSubExercises());

        rating.bind(ratingBinding);
    }

    public double getRating(){
        return rating.get();
    }

    public ReadOnlyDoubleProperty ratingProperty(){
        return rating.getReadOnlyProperty();
    }

    public String getId() {
        return id.get();
    }

    public SimpleStringProperty idProperty() {
        return id;
    }

    public void setId(String id) {
        this.id.set(id);
    }

    public String getPath() {
        return path.get();
    }

    public SimpleStringProperty pathProperty() {
        return path;
    }

    public void setPath(String path) {
        this.path.set(path);
    }

    public String getLecture() {
        return lecture.get();
    }

    public SimpleStringProperty lectureProperty() {
        return lecture;
    }

    public void setLecture(String lecture) {
        this.lecture.set(lecture);
    }

    public String getExerciseSheet() {
        return exerciseSheet.get();
    }

    public SimpleStringProperty exerciseSheetProperty() {
        return exerciseSheet;
    }

    public void setExerciseSheet(String exerciseSheet) {
        this.exerciseSheet.set(exerciseSheet);
    }

    public String getCorrector() {
        return corrector.get();
    }

    public SimpleStringProperty correctorProperty() {
        return corrector;
    }

    public void setCorrector(String corrector) {
        this.corrector.set(corrector);
    }

    public String getCorrectorEmail() {
        return correctorEmail.get();
    }

    public SimpleStringProperty correctorEmailProperty() {
        return correctorEmail;
    }

    public void setCorrectorEmail(String correctorEmail) {
        this.correctorEmail.set(correctorEmail);
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

    public Exercise getExercise() {
        return exercise.get();
    }

    public SimpleObjectProperty<Exercise> exerciseProperty() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise.set(exercise);
        this.initRatingBinding();
    }

    public void setRating(double rating) {
        this.rating.set(rating);
    }

    public boolean isChanged() {
        return changed.get();
    }

    public SimpleBooleanProperty changedProperty() {
        return changed;
    }

    public void setChanged(boolean changed) {
        this.changed.set(changed);
    }

    public CorrectionState getState() {
        return state.get();
    }

    public SimpleObjectProperty<CorrectionState> stateProperty() {
        return state;
    }

    public void setState(CorrectionState state) { this.state.set(state); }

    public String getNote() {
        return note.get();
    }

    public SimpleStringProperty noteProperty() {
        return note;
    }

    public void setNote(String note) {
        this.note.set(note);
    }
}

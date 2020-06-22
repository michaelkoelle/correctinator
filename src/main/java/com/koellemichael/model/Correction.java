package com.koellemichael.model;

import com.koellemichael.utils.Utils;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.beans.property.*;
import java.io.Serializable;

public class Correction implements Serializable {

    public enum CorrectionState {TODO, MARKED_FOR_LATER, FINISHED, NOT_INITIALIZED, PARSE_ERROR}

    //YAML Specs
    private SimpleStringProperty term;
    private SimpleStringProperty school;
    private SimpleStringProperty course;
    private SimpleObjectProperty<Sheet> sheet;
    private SimpleStringProperty rated_by;
    private SimpleStringProperty rated_at;
    private SimpleStringProperty submission;
    private ReadOnlyDoubleWrapper points;
    private SimpleBooleanProperty rating_done;

    //Legacy
    private SimpleStringProperty email;

    //correctinator specs
    private SimpleStringProperty path;
    private SimpleStringProperty globalComment;
    private SimpleObjectProperty<Exercise> exercise;
    private SimpleBooleanProperty changed;
    private SimpleObjectProperty<CorrectionState> state;
    private SimpleStringProperty note;

    public Correction() {
        this.term = new SimpleStringProperty("");
        this.school = new SimpleStringProperty("");
        this.course = new SimpleStringProperty("");
        this.sheet = new SimpleObjectProperty<>(new Sheet("","", new Grading(0, "")));
        this.rated_by = new SimpleStringProperty("");
        this.rated_at = new SimpleStringProperty("");
        this.submission = new SimpleStringProperty("");
        this.points = new ReadOnlyDoubleWrapper(0);
        this.rating_done = new SimpleBooleanProperty(false);

        this.email = new SimpleStringProperty();

        this.path = new SimpleStringProperty("");
        this.globalComment = new SimpleStringProperty("");
        this.exercise = new SimpleObjectProperty<>();
        this.changed = new SimpleBooleanProperty(false);
        this.state = new SimpleObjectProperty<>(CorrectionState.TODO);
        this.note = new SimpleStringProperty("");
    }

    public Correction(String term, String school, String course, Sheet sheet, String rated_by, String rated_at, String submission, Double points, boolean rating_done, String path, String globalComment, Exercise exercise, boolean changed, CorrectionState state, String note) {
        //YAML
        this.term = new SimpleStringProperty(term);
        this.school = new SimpleStringProperty(school);
        this.course = new SimpleStringProperty(course);
        this.sheet = new SimpleObjectProperty<>(sheet);
        this.rated_by = new SimpleStringProperty(rated_by);
        this.rated_at = new SimpleStringProperty(rated_at);
        this.submission = new SimpleStringProperty(submission);
        if(points == null) points = 0.0;
        this.points = new ReadOnlyDoubleWrapper(points);
        this.rating_done = new SimpleBooleanProperty(rating_done);

        //Legacy
        this.email = new SimpleStringProperty();

        //Correctinator
        this.path = new SimpleStringProperty(path);
        this.globalComment = new SimpleStringProperty(globalComment);
        this.exercise = new SimpleObjectProperty<>(exercise);
        this.changed = new SimpleBooleanProperty(changed);
        this.state = new SimpleObjectProperty<>(state);
        this.note = new SimpleStringProperty(note);
    }

    //Legacy
    public Correction(String course, double maxPoints, String sheetName, String rated_by, String email, String submission, Double points, String path, String globalComment, Exercise exercise, CorrectionState state, String note) {
        //YAML
        this.term = new SimpleStringProperty(null);
        this.school = new SimpleStringProperty(null);
        this.course = new SimpleStringProperty(course);
        this.sheet = new SimpleObjectProperty<>(new Sheet(sheetName, null, new Grading(maxPoints, "points")));
        this.rated_by = new SimpleStringProperty(rated_by);
        this.rated_at = new SimpleStringProperty(null);
        this.submission = new SimpleStringProperty(submission);
        if(points == null) points = 0.0;
        this.points = new ReadOnlyDoubleWrapper(points);
        this.rating_done = new SimpleBooleanProperty(true);

        //Legacy
        this.email = new SimpleStringProperty(email);

        //Correctinator
        this.path = new SimpleStringProperty(path);
        this.globalComment = new SimpleStringProperty(globalComment);
        this.exercise = new SimpleObjectProperty<>(exercise);
        this.changed = new SimpleBooleanProperty(false);
        this.state = new SimpleObjectProperty<>(state);
        this.note = new SimpleStringProperty(note);
    }

    public Correction(String submission, String path, CorrectionState state) {
        //YAML
        this.term = new SimpleStringProperty(null);
        this.school = new SimpleStringProperty(null);
        this.course = new SimpleStringProperty(null);
        this.sheet = new SimpleObjectProperty<>(new Sheet(null, null, new Grading(0, null)));
        this.rated_by = new SimpleStringProperty(null);
        this.rated_at = new SimpleStringProperty(null);
        this.submission = new SimpleStringProperty(submission);
        this.points = new ReadOnlyDoubleWrapper(0);
        this.rating_done = new SimpleBooleanProperty(false);

        //Legacy
        this.email = new SimpleStringProperty();

        //Correctinator
        this.path = new SimpleStringProperty(path);
        this.globalComment = new SimpleStringProperty(null);
        this.exercise = new SimpleObjectProperty<>(null);
        this.changed = new SimpleBooleanProperty(false);
        this.state = new SimpleObjectProperty<>(state);
        this.note = new SimpleStringProperty(null);
    }

    public void initRatingBinding() {
        DoubleBinding ratingBinding = Bindings.createDoubleBinding(() -> this.getExercise().getSubExercises().stream().flatMap(Utils::flatten).mapToDouble(e -> {
            if (e instanceof ExerciseRating) {
                return ((ExerciseRating) e).getRating();
            } else {
                return 0;
            }
        }).sum(), this.getExercise().getSubExercises());

        points.bind(ratingBinding);
    }

    public String getTerm() {
        return term.get();
    }

    public SimpleStringProperty termProperty() {
        return term;
    }

    public void setTerm(String term) {
        this.term.set(term);
    }

    public String getSchool() {
        return school.get();
    }

    public SimpleStringProperty schoolProperty() {
        return school;
    }

    public void setSchool(String school) {
        this.school.set(school);
    }

    public String getCourse() {
        return course.get();
    }

    public SimpleStringProperty courseProperty() {
        return course;
    }

    public void setCourse(String course) {
        this.course.set(course);
    }

    public Sheet getSheet() {
        return sheet.get();
    }

    public SimpleObjectProperty<Sheet> sheetProperty() {
        return sheet;
    }

    public void setSheet(Sheet sheet) {
        this.sheet.set(sheet);
    }

    public String getRated_by() {
        return rated_by.get();
    }

    public SimpleStringProperty rated_byProperty() {
        return rated_by;
    }

    public void setRated_by(String rated_by) {
        this.rated_by.set(rated_by);
    }

    public String getRated_at() {
        return rated_at.get();
    }

    public SimpleStringProperty rated_atProperty() {
        return rated_at;
    }

    public void setRated_at(String rated_at) {
        this.rated_at.set(rated_at);
    }

    public String getSubmission() {
        return submission.get();
    }

    public SimpleStringProperty submissionProperty() {
        return submission;
    }

    public void setSubmission(String submission) {
        this.submission.set(submission);
    }

    public double getPoints() {
        return points.get();
    }

    public ReadOnlyDoubleWrapper pointsProperty() {
        return points;
    }

    public void setPoints(double points) {
        this.points.set(points);
    }

    public boolean isRating_done() {
        return rating_done.get();
    }

    public SimpleBooleanProperty rating_doneProperty() {
        return rating_done;
    }

    public void setRating_done(boolean rating_done) {
        this.rating_done.set(rating_done);
    }

    public String getEmail() {
        return email.get();
    }

    public SimpleStringProperty emailProperty() {
        return email;
    }

    public void setEmail(String email) {
        this.email.set(email);
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

    public String getGlobalComment() {
        return globalComment.get();
    }

    public SimpleStringProperty globalCommentProperty() {
        return globalComment;
    }

    public void setGlobalComment(String globalComment) {
        this.globalComment.set(globalComment);
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

    public void setState(CorrectionState state) {
        this.state.set(state);
    }

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

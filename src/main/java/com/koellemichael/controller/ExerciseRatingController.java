package com.koellemichael.controller;

import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.PreferenceKeys;
import com.koellemichael.utils.Uni2WorkParser;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ObjectProperty;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.ActionEvent;
import javafx.geometry.Insets;
import javafx.scene.control.Label;
import javafx.scene.control.Spinner;
import javafx.scene.control.SpinnerValueFactory;
import javafx.scene.control.TextArea;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

import java.io.IOException;
import java.util.prefs.Preferences;

public class ExerciseRatingController implements ChangeListener {

    public Label lbl_exercise_name;
    public Spinner<Double> sp_rating;
    public Label lbl_max_points;
    public TextArea ta_comments;
    public VBox exercise_rating_container;
    public HBox exercise_label_container;
    private ExerciseRating e;
    private Label autoGenLabel;

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

        autoGenLabel = new Label("Diese Aufgabe wurde automatisch korrigiert");
        autoGenLabel.setBackground(new Background(new BackgroundFill(Color.web("#90ee90",0.5), new CornerRadii(3), Insets.EMPTY)));

        if(e.isAutoGen()){
            exercise_rating_container.getChildren().add(1,autoGenLabel);
        }

        //TODO falls die listener weg sind funktioniert das binding nicht mehr richtig weil .asObject vom gc entfernt wird
        e.ratingProperty().addListener(this);
        e.commentProperty().addListener(this);
    }


    @Override
    public void changed(ObservableValue observable, Object oldValue, Object newValue) {
        e.changed();

        if(e.isAutoGen()){
            //exercise_label_container.setBackground(new Background(new BackgroundFill(Color.web("#f4f4f4"), CornerRadii.EMPTY, Insets.EMPTY)));
            exercise_rating_container.getChildren().remove(autoGenLabel);
        }

        Preferences pref = Preferences.userRoot();
        if(pref.getBoolean(PreferenceKeys.AUTOSAVE_PREF, false)){
            try {
                Uni2WorkParser.saveRatingFile(e.getCorrection());
            } catch (IOException ignored) {}
        }
    }

    public void onSetMaxPoints(ActionEvent actionEvent) {
        if(e.getComment().equals("Lösung fehlt")){
            e.setComment("");
        }
        e.setRating(e.getMaxPoints());
    }

    public void onMissingSolution(ActionEvent actionEvent) {
        e.setRating(0);
        e.setComment("Lösung fehlt");
    }
}

package com.koellemichael.controller;

import com.koellemichael.exceptions.FileNotInitializedException;
import com.koellemichael.exceptions.ParseRatingFileException;
import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.*;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.skin.TableViewSkin;
import javafx.scene.control.skin.VirtualFlow;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.prefs.Preferences;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.koellemichael.utils.PreferenceKeys.INIT_PREF;

public class Controller{

    public TableView tv_corrections;
    public TableColumn<Correction, String> tc_id;
    public TableColumn<Correction, String> tc_path;
    public TableColumn<Correction, Boolean> tc_changed;
    public TableColumn<Correction, Correction.CorrectionState> tc_state;
    public TableColumn<Correction, Number> tc_rating;
    public TableColumn<Correction, Number> tc_max_points;
    public TableColumn<Correction, String> tc_exercise_sheet;
    public TableColumn<Correction, String> tc_lecture;
    public TableColumn<Correction, String> tc_corrector;
    public TableColumn<Correction, String> tc_corrector_email;

    public ProgressBar pb_correction;
    public Label lbl_current_id;
    public Label lbl_current_rating;
    public VBox vbox_edit;
    public Label lbl_current_max_points;
    public Button btn_back;
    public Button btn_mark_for_later;
    public Button btn_done;
    public SplitPane split_main;
    public ScrollPane sb_comments;
    public TextArea ta_note;
    public ScrollPane sp_note;

    public TextArea ta_global_comment;
    public AnchorPane global_comment;
    public MenuBar menu;
    public MenuController menuController;

    private Stage primaryStage = null;
    public ObservableList<Correction> corrections;
    public File correctionsDirectory;
    private Preferences preferences;
    private MediaViewController mediaViewController;

    private ChangeListener<Correction.CorrectionState> stateChangeListener;
    private ChangeListener<Number> ratingChangeListener;

    public void initialize(Stage primaryStage){
        this.primaryStage = primaryStage;
        this.preferences = Preferences.userRoot();

        corrections = FXCollections.observableArrayList(e -> new Observable[]{
                e.stateProperty(),
                e.changedProperty(),
                e.maxPointsProperty(),
                e.idProperty(),
                e.correctorEmailProperty(),
                e.correctorProperty(),
                e.exerciseSheetProperty(),
                e.lectureProperty(),
                e.pathProperty(),
                e.exerciseProperty()
        });

        tc_id.setCellValueFactory(cell -> cell.getValue().idProperty());
        tc_path.setCellValueFactory(cell -> cell.getValue().pathProperty());
        tc_rating.setCellValueFactory(cell -> cell.getValue().ratingProperty());
        tc_changed.setCellValueFactory(cell -> cell.getValue().changedProperty());
        tc_state.setCellValueFactory(cell -> cell.getValue().stateProperty());

        tc_max_points.setCellValueFactory(cell -> cell.getValue().maxPointsProperty());
        tc_exercise_sheet.setCellValueFactory(cell -> cell.getValue().exerciseSheetProperty());
        tc_lecture.setCellValueFactory(cell -> cell.getValue().lectureProperty());
        tc_corrector.setCellValueFactory(cell -> cell.getValue().correctorProperty());
        tc_corrector_email.setCellValueFactory(cell -> cell.getValue().correctorEmailProperty());

        tv_corrections.getSelectionModel().selectedItemProperty().addListener(this::onSelectionChanged);
        tv_corrections.getSelectionModel().clearSelection();

        primaryStage.setFullScreen(preferences.getBoolean(PreferenceKeys.FULLSCREEN_PREF,false));
        stateChangeListener = this::onStateChange;

        sp_note.setManaged(false);
        global_comment.setManaged(false);
        primaryStage.setOnCloseRequest(this::closeWindowEvent);

        menuController.initialize(primaryStage,this);

        if(!preferences.get(PreferenceKeys.LAST_OPENED_DIR_PREF,"").equals("")){
            File dir = new File(preferences.get(PreferenceKeys.LAST_OPENED_DIR_PREF,""));
            if(dir.isDirectory() && dir.exists()){
                correctionsDirectory = dir;
                openCorrections();
            }
        }
    }

    public void openCorrections(){
        reloadRatingFiles();

        if(preferences.getBoolean(PreferenceKeys.VERBOSE_PREF,false)){
            showImportSummary();
        }

        if(!corrections.filtered(c -> c.getState()== Correction.CorrectionState.NOT_INITIALIZED).isEmpty()){
            notAllFilesInitializedDialog();
        }

        if(!corrections.filtered(c -> c.getState()== Correction.CorrectionState.PARSE_ERROR).isEmpty()){
            //TODO user die möglichkeit geben die datei anzupassen oder zu überschrieben, evtl counter wie viele nicht geparsed werden konnten
        }
    }

    private void onSelectionChanged(ObservableValue observableValue, Object oldSelection, Object newSelection){

        if(oldSelection instanceof Correction){
            Correction c = (Correction) oldSelection;
            c.stateProperty().removeListener(stateChangeListener);
            c.ratingProperty().removeListener(ratingChangeListener);
            if(c.isChanged()){
                if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                    try {
                        RatingFileParser.saveRatingFile(c);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    c.setState(Correction.CorrectionState.FINISHED);
                }else{
                    Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                    alert.setTitle("Änderungen nicht gespeichert");
                    alert.setHeaderText("Die Abgabe wurde noch nicht gespeichert.");
                    alert.setContentText("Möchten sie die Abgabe jetzt speichern?");

                    Optional<ButtonType> result = alert.showAndWait();
                    if (result.isPresent() && result.get() == ButtonType.OK){
                        try {
                            RatingFileParser.saveRatingFile(c);
                        } catch (IOException e) {
                            errorDialog("Fehler beim speichern der Datei", "Die Datei \"" + c.getPath() + "\" konnte nicht gespeichert werden");
                        }
                    }
                }
            }
            ta_note.textProperty().unbindBidirectional(c.noteProperty());
            ta_global_comment.textProperty().unbindBidirectional(c.globalCommentProperty());
        }

        if(newSelection instanceof Correction){
            Correction c = (Correction) newSelection;
            c.stateProperty().addListener(stateChangeListener);
            lbl_current_id.textProperty().bind(c.idProperty());
            lbl_current_rating.textProperty().bind(Bindings.convert(c.ratingProperty()));
            lbl_current_max_points.textProperty().bind(Bindings.convert(c.maxPointsProperty()));
            vbox_edit.getChildren().clear();

            global_comment.setManaged(true);
            //TODO Liste hierarchisch, nicht flatten benutzen
            if(c.getExercise() != null){
                List<Exercise> list = c.getExercise().getSubExercises().stream().flatMap(Utils::flatten).collect(Collectors.toList());

                for(Exercise e : list){
                    if(e instanceof ExerciseRating){
                        try {
                            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/exercise.fxml"));
                            Pane p = loader.load();
                            int top = 0;
                            if(e.getDepth()==1 && list.indexOf(e)!=0){
                                top = 20;
                            }
                            p.setPadding(new Insets(top,0,0,(e.getDepth()-1)*40));
                            ExerciseRatingController controller = loader.getController();
                            controller.initialize((ExerciseRating)e);
                            vbox_edit.getChildren().add(p);
                        } catch (IOException ex) {
                            ex.printStackTrace();
                        }
                    }else{
                        try {
                            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/exerciselabel.fxml"));
                            Pane p = loader.load();
                            int top = 0;
                            if(e.getDepth()==1){
                                top = 20;
                            }
                            p.setPadding(new Insets(top,0,0,(e.getDepth()-1)*40));
                            ExerciseLabelController controller = loader.getController();
                            controller.initialize(e);
                            vbox_edit.getChildren().add(p);
                        } catch (IOException ex) {
                            ex.printStackTrace();
                        }
                    }
                }
            }

            if(preferences.getBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF, true)){
                sb_comments.setVvalue(0);
            }

            if(!corrections.isEmpty()){
                try {
                    if (split_main.getItems().size() <= 1) {
                        FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/mediaview.fxml"));
                        Pane mediaPane = loader.load();
                        mediaViewController = loader.getController();
                        split_main.getItems().add(mediaPane);
                        if(!split_main.getDividers().isEmpty()){
                            split_main.setDividerPositions(0.4);
                        }
                    }
                } catch (IOException ex) {
                    ex.printStackTrace();
                }
            }

            ArrayList<File> files = new ArrayList<>();
            File fileDir = new File(c.getPath()).getParentFile();
            FileFilter ff = (file) ->{
                Pattern ratingFilePattern = Pattern.compile("bewertung_([0-9]+)\\.txt");
                if(ratingFilePattern.matcher(file.getName()).find()){
                    return false;
                }
                try {
                    String mimeType = Files.probeContentType(Paths.get(file.toURI()));
                    if(mimeType == null){
                        return false;
                    }
                    switch (mimeType){
                        case "application/pdf":
                        case "image/bmp":
                        case "image/gif":
                        case "image/jpeg":
                        case "image/png":
                        case "image/svg+xml":
                        case "image/tiff":
                        case "text/css":
                        case "text/html":
                        case "text/javascript":
                        case "text/plain":
                        case "text/richtext":
                        case "text/rtf":
                        case "text/tab-separated-values":
                        case "text/comma-separated-values":
                        case "text/xml":
                        default: return true;
                    }
                } catch (IOException e) {
                    return false;
                }
            };

            FileUtils.listFiles(fileDir.getAbsolutePath(), files, ff, dir -> !dir.getName().contains("__MACOSX"));
            mediaViewController.initialize(files);

            ta_note.textProperty().bindBidirectional(c.noteProperty());
            c.noteProperty().addListener((observableValue1, s, t1) -> {
                c.setChanged(true);
                if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                    try {
                        RatingFileParser.saveRatingFile(c);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });

            ta_global_comment.textProperty().bindBidirectional(c.globalCommentProperty());
            c.globalCommentProperty().addListener((observableValue1, s, t1) -> {
                c.setChanged(true);
                if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                    try {
                        RatingFileParser.saveRatingFile(c);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });

            if(c.getState() != Correction.CorrectionState.MARKED_FOR_LATER){
                btn_mark_for_later.setText("Markieren");
                sp_note.setManaged(false);
            }else {
                btn_mark_for_later.setText("Markierung entfernen");
                sp_note.setManaged(true);

            }

            ratingChangeListener = (observable, oldValue, newValue) -> {
                if(preferences.getBoolean(PreferenceKeys.AUTOCOMMENT_PREF, true)){
                    c.setGlobalComment(AutocommentUtils.replaceAutoCommentWithString(c.getGlobalComment(),AutocommentUtils.buildAutoComment(c)));
                }
            };
            c.ratingProperty().addListener(ratingChangeListener);

            if(preferences.getBoolean(PreferenceKeys.AUTOCOMMENT_PREF, true)){
                c.setGlobalComment(AutocommentUtils.replaceAutoCommentWithString(c.getGlobalComment(),AutocommentUtils.buildAutoComment(c)));
            }
        }
    }

    public void onStateChange(ObservableValue<? extends Correction.CorrectionState> observable, Correction.CorrectionState oldValue, Correction.CorrectionState newValue) {

        if(corrections.filtered(correction -> correction.getState() != Correction.CorrectionState.FINISHED).isEmpty()){
            suggestCreatingZip();
        }
    }



    private void suggestCreatingZip() {
        Alert d = new Alert(Alert.AlertType.CONFIRMATION);
        d.setTitle("Korrektur fertig");
        d.setHeaderText("Es sieht so aus als wäre die Korrektur fertig.");
        d.setContentText("Möchten Sie sie die Abgaben als Zip exportieren?");
        d.getButtonTypes().clear();
        d.getButtonTypes().addAll(ButtonType.CANCEL,ButtonType.YES);
        Optional<ButtonType> res = d.showAndWait();

        res.ifPresent(type -> {
            if(type == ButtonType.YES){
                FileUtils.exportAsZipWithFileChooser(correctionsDirectory,correctionsDirectory.getParentFile(),("Korrektur_" + corrections.get(0).getLecture() + "_" + corrections.get(0).getExerciseSheet()).replace(" ", "_"),primaryStage);
            }
        });
    }

    public void showImportSummary(){
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Zusammenfassung");
        alert.setHeaderText(null);
        StringBuilder content = new StringBuilder();

        content.append("Es wurden ").append(corrections.size()).append(" Abgaben gefunden!");

        if(!corrections.filtered(c -> c.getState() == Correction.CorrectionState.PARSE_ERROR).isEmpty()){
            content.append("\n").append(corrections.filtered(c -> c.getState() == Correction.CorrectionState.PARSE_ERROR).size()).append(" Datei(en) konnten nicht vollständig geparsed werden!");
        }

        if(!corrections.filtered(c -> c.getState() == Correction.CorrectionState.NOT_INITIALIZED).isEmpty()){
            content.append("\n").append(corrections.filtered(c -> c.getState() == Correction.CorrectionState.NOT_INITIALIZED).size()).append(" Datei(en) wurden noch nicht initialisiert!");
        }

        alert.setContentText(content.toString());
        alert.showAndWait();
    }

    private void initializeCommentSection(List<Correction> notInitialized, String initText){
        notInitialized.forEach(c-> {
            try {
                RatingFileParser.initializeComments(c,initText);
            } catch (IOException e) {
                errorDialog("Fehlerhafte Bewertungsdatei", "Die Bewertungsdatei \"" + c.getPath() + "\" konnte nicht gelesen werden! ");
            } catch (ParseRatingFileException e) {
                errorDialog("Fehlerhafte Bewertungsdatei", "Die Bewertungsdatei \"" + c.getPath() + "\" ist fehlerhaft! ");
            }
        });

        reloadRatingFiles();
    }

    private void initializeCommentSectionDialog(List<Correction> notInitialized){
        Alert initDialog = new Alert(Alert.AlertType.CONFIRMATION);
        initDialog.setTitle("Initialisierung");
        initDialog.setHeaderText("Initialisierung des Kommentarfelds");
        initDialog.setContentText("Tragen sie das initiale Aufgabenschema ein:");
        initDialog.getButtonTypes().clear();
        initDialog.getButtonTypes().add(ButtonType.CANCEL);
        initDialog.getButtonTypes().add(ButtonType.FINISH);
        TextArea textArea = new TextArea();
        textArea.setText(preferences.get(INIT_PREF, ""));
        initDialog.getDialogPane().setContent(textArea);
        Optional<ButtonType> b = initDialog.showAndWait();
        b.ifPresent(buttonType -> {
            if(buttonType==ButtonType.FINISH){
                String initText = textArea.getText();
                preferences.put(INIT_PREF, initText);
                initializeCommentSection(notInitialized,initText);
            }
        });
    }

    public void initializeCommentSectionDialog(){
        Alert initDialog = new Alert(Alert.AlertType.CONFIRMATION);
        initDialog.setTitle("Initialisierung");
        initDialog.setHeaderText("Initialisierung des Kommentarfelds");
        initDialog.setContentText("Tragen sie das initiale Aufgabenschema ein:");
        initDialog.getButtonTypes().clear();

        ButtonType onlyNotInitialized = new ButtonType("Initialisiere NOT INITIALIZED");
        ButtonType onlyParseError = new ButtonType("Initialisiere PARSE ERROR");
        ButtonType onlySelection = new ButtonType("Initialisiere aktuelle Auswahl");
        ButtonType all = new ButtonType("Initialisiere alle");

        initDialog.getButtonTypes().add(ButtonType.CANCEL);

        if(!corrections.filtered(c -> c.getState()== Correction.CorrectionState.NOT_INITIALIZED).isEmpty()){
            initDialog.getButtonTypes().add(onlyNotInitialized);
        }
        if(!corrections.filtered(c -> c.getState()== Correction.CorrectionState.PARSE_ERROR).isEmpty()){
            initDialog.getButtonTypes().add(onlyParseError);
        }
        getSelectedCorrection().ifPresent(c -> initDialog.getButtonTypes().add(onlySelection));

        initDialog.getButtonTypes().add(all);

        TextArea textArea = new TextArea();
        Preferences preferences = Preferences.userRoot();
        textArea.setText(preferences.get(INIT_PREF, ""));
        initDialog.getDialogPane().setContent(textArea);
        Optional<ButtonType> b = initDialog.showAndWait();
        b.ifPresent(buttonType -> {
            String initText = textArea.getText();
            preferences.put(INIT_PREF, initText);

            if(buttonType==onlySelection){
                getSelectedCorrection().ifPresent(correction -> {
                    ArrayList<Correction> list = new ArrayList<>();
                    list.add(correction);
                    initializeCommentSection(list, initText);
                });
            }
            if(buttonType==all){
                initializeCommentSection(corrections,initText);
            }
            if(buttonType==onlyNotInitialized){
                initializeCommentSection(corrections.filtered(c -> c.getState()== Correction.CorrectionState.NOT_INITIALIZED),initText);
            }
            if(buttonType==onlyParseError){
                initializeCommentSection(corrections.filtered(c -> c.getState()== Correction.CorrectionState.PARSE_ERROR),initText);
            }

        });
    }

    public void reloadRatingFiles(){
        if(correctionsDirectory != null){
            Pattern ratingFilePattern = Pattern.compile("bewertung_([0-9]+)\\.txt");
            ArrayList<File> ratingFiles = new ArrayList<>();
            FileUtils.listFiles(correctionsDirectory.getAbsolutePath(),ratingFiles,file-> file.getName().matches(ratingFilePattern.pattern()), dir ->!dir.getName().contains("__MACOSX"));

            if(!ratingFiles.isEmpty()){
                tv_corrections.getItems().clear();
                corrections.clear();

                ratingFiles.forEach(ratingFile ->{
                    Matcher m = ratingFilePattern.matcher(ratingFile.getName());
                    if(m.find()){
                        String id = m.group(1);
                        Correction c;
                        try {
                            c = RatingFileParser.parseFile(ratingFile.getAbsolutePath());
                        } catch (IOException | ParseRatingFileException e) {
                            c = new Correction();
                            c.setState(Correction.CorrectionState.PARSE_ERROR);
                            c.setPath(ratingFile.getAbsolutePath());
                            c.setId(id);
                        } catch (FileNotInitializedException e) {
                            c = new Correction();
                            c.setState(Correction.CorrectionState.NOT_INITIALIZED);
                            c.setPath(ratingFile.getAbsolutePath());
                            c.setId(id);
                        }
                        corrections.add(c);
                    }
                });

                if(corrections != null && corrections.size() > 0){
                    tv_corrections.setItems(corrections);

                    pb_correction.progressProperty().bind(Bindings.createDoubleBinding(()-> {
                        OptionalDouble value = corrections.stream().mapToDouble((c) -> (c.getState() == Correction.CorrectionState.FINISHED)?1:0).average();
                        if(value.isPresent()){
                            return value.getAsDouble();
                        }else{
                            return 0.0;
                        }
                    }, corrections));

                    tv_corrections.getSelectionModel().clearSelection();
                    tv_corrections.getSelectionModel().selectFirst();
                }
            }else{
                errorDialog("Abgaben nicht gefunden","Es konnten keine Abgaben gefunden werden!");
            }
        }
    }

    private void errorDialog(String title, String message){
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    public void notAllFilesInitializedDialog(){
        Alert d = new Alert(Alert.AlertType.WARNING);
        d.setTitle("Kommentarsektion initialisieren");
        d.setHeaderText("Einige Dateien wurden noch nicht initialisiert.");
        d.setContentText("Möchten Sie sie jetzt initialisieren?");
        d.getButtonTypes().clear();
        d.getButtonTypes().addAll(ButtonType.CANCEL,ButtonType.YES);
        Optional<ButtonType> res = d.showAndWait();

        res.ifPresent(type -> {
            if(type == ButtonType.YES){
                initializeCommentSectionDialog(corrections.filtered(c -> c.getState()== Correction.CorrectionState.NOT_INITIALIZED));
            }
        });
    }

    public void onBack(ActionEvent actionEvent) {
        tv_corrections.getSelectionModel().selectPrevious();
    }

    public void onMarkForLater(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {

            if(c.getState()== Correction.CorrectionState.MARKED_FOR_LATER){
                c.setState(Correction.CorrectionState.TODO);
                ((Button) actionEvent.getSource()).setText("Markieren");
                sp_note.setManaged(false);
            }else {
                c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
                ((Button) actionEvent.getSource()).setText("Markierung entfernen");
                sp_note.setManaged(true);
            }
            c.setChanged(true);
            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                try {
                    RatingFileParser.saveRatingFile(c);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

        });
    }

    public void onDone(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {

            if (c.getState() == Correction.CorrectionState.TODO) {
                c.setState(Correction.CorrectionState.FINISHED);
            }

            if(preferences.getBoolean(PreferenceKeys.AUTOCOMMENT_PREF, true)){
                c.setGlobalComment(AutocommentUtils.replaceAutoCommentWithString(c.getGlobalComment(),AutocommentUtils.buildAutoComment(c)));
            }

            try {
                RatingFileParser.saveRatingFile(c);
            } catch (IOException e) {
                e.printStackTrace();
            }


            if(tv_corrections.getItems().indexOf(c) == tv_corrections.getItems().size()-1){
                showUnfinishedCorrection();
            }else{
                tv_corrections.getSelectionModel().selectNext();
                int index = tv_corrections.getSelectionModel().getSelectedIndex();
                scrollToIndex(index, 1);
            }

        });
    }

    private void scrollToIndex(int index, double topFactor) {
        TableViewSkin<?> ts = (TableViewSkin<?>) tv_corrections.getSkin();
        VirtualFlow<?> vf = (VirtualFlow<?>)ts.getChildren().get(1);

        int first = vf.getFirstVisibleCell().getIndex();
        int last = vf.getLastVisibleCell().getIndex();

        int scrollIndex = (int)(index - ((last - first)/topFactor));
        if(scrollIndex >= 0 && (index > last || index < first)) {

            tv_corrections.scrollTo(scrollIndex);
        }
    }

    public void showUnfinishedCorrection() {
        corrections.filtered(correction -> (correction.getState() != Correction.CorrectionState.FINISHED)).stream().findFirst().ifPresent(obj -> {
            tv_corrections.getSelectionModel().select(obj);
            int index = tv_corrections.getItems().indexOf(obj);
            scrollToIndex(index, 3);
        });
    }

    public Optional<Correction> getSelectedCorrection(){
        Correction c = (Correction) tv_corrections.getSelectionModel().getSelectedItem();
        if(c != null){
            return Optional.of(c);
        }else{
            return Optional.empty();
        }
    }

    private void closeWindowEvent(WindowEvent event) {
        List<Correction> changedCorrections = new ArrayList<>(corrections.filtered(Correction::isChanged));
        if(!changedCorrections.isEmpty()){
            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                changedCorrections.forEach(c -> {
                    try {
                        RatingFileParser.saveRatingFile(c);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                });
            }else{
                Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                alert.getButtonTypes().add(ButtonType.CLOSE);
                alert.setTitle("Änderungen nicht gespeichert");
                alert.setHeaderText(changedCorrections.size() + " Abgabe(n) wurden noch nicht gespeichert.");
                alert.setContentText("Möchten sie die Abgaben jetzt speichern?");

                Optional<ButtonType> result = alert.showAndWait();
                if (result.isPresent() && result.get() == ButtonType.OK){
                    changedCorrections.forEach(c -> {
                        try {
                            RatingFileParser.saveRatingFile(c);
                        } catch (IOException e) {
                            errorDialog("Fehler beim speichern der Datei", "Die Datei \"" + c.getPath() + "\" konnte nicht gespeichert werden");
                        }
                    });
                }
                if(result.isPresent() && result.get() == ButtonType.CANCEL){
                    event.consume();
                }
            }
        }
    }

    public void onSetTODO(ActionEvent actionEvent) {
        menuController.onSetTODO(actionEvent);
    }

    public void onSetMARKED(ActionEvent actionEvent) {
        menuController.onSetMarked(actionEvent);
    }

    public void onSetFINISHED(ActionEvent actionEvent) {
        menuController.onSetFinished(actionEvent);
    }
}

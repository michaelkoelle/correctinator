package com.koellemichael.controller;

import com.koellemichael.exceptions.FileNotInitializedException;
import com.koellemichael.exceptions.NoFilesInDirectoryException;
import com.koellemichael.exceptions.ParseRatingFileException;
import com.koellemichael.exceptions.RatingFileNotUniqueException;
import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.PreferenceKeys;
import com.koellemichael.utils.RatingFileParser;
import com.koellemichael.utils.Utils;
import javafx.application.Platform;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
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
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.prefs.Preferences;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
    public MenuItem mi_open_corrections;
    public MenuItem mi_save_current_correction;
    public MenuItem mi_export_zip;
    public CheckMenuItem mi_autosave;
    public MenuItem mi_initialize;
    public Button btn_back;
    public Button btn_mark_for_later;
    public Button btn_done;
    public SplitPane split_main;
    public AnchorPane bp_mid_main;
    public CheckMenuItem btn_fullscreen;
    public CheckMenuItem btn_verbose;
    public ScrollPane sb_comments;
    public CheckMenuItem mi_autoscroll_top;
    public TextArea ta_note;

    private Stage primaryStage = null;
    private ObservableList<Correction> corrections;
    private File correctionsDirectory;
    private Preferences preferences;
    private MediaViewController mediaViewController;
    private Pane mediaPane;

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

        pb_correction.progressProperty().addListener(this::onProgressBarChanged);
        mi_autosave.setSelected(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF, false));
        mi_autoscroll_top.setSelected(preferences.getBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF, true));
        btn_fullscreen.setSelected(preferences.getBoolean(PreferenceKeys.FULLSCREEN_PREF,false));
        primaryStage.setFullScreen(preferences.getBoolean(PreferenceKeys.FULLSCREEN_PREF,false));
        btn_verbose.setSelected(preferences.getBoolean(PreferenceKeys.VERBOSE_PREF,false));
        menuDisable();

        corrections.addListener((ListChangeListener) c -> {
            while(c.next()){
                menuDisable();
            }
        });
    }

    public void onOpenDirectory(ActionEvent actionEvent) {
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Abgaben öffnen");
        correctionsDirectory = chooser.showDialog(primaryStage);

        try {
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

        } catch (NoFilesInDirectoryException e) {
            errorDialog("Verzeichnisfehler", "Keine Abgaben gefunden!");
        } catch (FileNotFoundException ignored) {}
    }

    private void onSelectionChanged(ObservableValue observableValue, Object oldSelection, Object newSelection){

        if(oldSelection instanceof Correction){
            Correction c = (Correction) oldSelection;
            if(c.isChanged()){
                if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,false)){
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
        }

        if(newSelection instanceof Correction){
            Correction c = (Correction) newSelection;
            lbl_current_id.textProperty().bind(c.idProperty());
            lbl_current_rating.textProperty().bind(Bindings.convert(c.ratingProperty()));
            lbl_current_max_points.textProperty().bind(Bindings.convert(c.maxPointsProperty()));
            vbox_edit.getChildren().clear();

            //TODO Liste hierarchisch, nicht flatten benutzen
            if(c.getExercise() != null){
                List<Exercise> list = c.getExercise().getSubExercises().stream().flatMap(Utils::flatten).collect(Collectors.toList());

                for(Exercise e : list){
                    if(e instanceof ExerciseRating){
                        try {
                            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/exercise.fxml"));
                            Pane p = loader.load();
                            p.setPadding(new Insets(0,0,0,(e.getDepth()-1)*40));
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
                            p.setPadding(new Insets(0,0,0,(e.getDepth()-1)*40));
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
                        mediaPane = loader.load();
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
                try {
                    String mimeType = Files.probeContentType(Paths.get(file.toURI()));
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

            listFiles(fileDir.getAbsolutePath(), files, ff);
            mediaViewController.initialize(files);

            ta_note.textProperty().bindBidirectional(c.noteProperty());
            ta_note.textProperty().addListener((observableValue1, s, t1) -> {
                c.setChanged(true);
                if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,false)){
                    try {
                        RatingFileParser.saveRatingFile(c);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });

        }
    }

    public void menuDisable(){
        if(!corrections.isEmpty()){
            mi_initialize.setDisable(false);
            mi_save_current_correction.setDisable(false);
            mi_export_zip.setDisable(false);
        }else{
            mi_initialize.setDisable(true);
            mi_save_current_correction.setDisable(true);
            mi_export_zip.setDisable(true);
        }
    }

    public void onProgressBarChanged(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
        if(newValue.doubleValue() == 1.0){
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
                exportAsZipWithFileChooser();
            }
        });
    }

    public File getRatingFileFromDirectory(File directory) throws FileNotFoundException, RatingFileNotUniqueException {
        File[] ratings = directory.listFiles((dir, name) -> name.matches("bewertung_[0-9]+\\.txt"));

        if (ratings != null && ratings.length>0) {
            if(ratings.length>1){
                throw new RatingFileNotUniqueException(directory);
            }
            return ratings[0];

        }else{
            throw new FileNotFoundException();
        }
    }



    private void showImportSummary(){
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

        try {
            reloadRatingFiles();
        } catch (NoFilesInDirectoryException e) {
            errorDialog("Verzeichnisfehler", "Keine Abgaben gefunden!");
        } catch (FileNotFoundException e) {
            errorDialog("Verzeichnisfehler", "Das ausgewählte Verzeichnis existiert nicht mehr");
        }
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

    private void initializeCommentSectionDialog(){
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

    public void reloadRatingFiles() throws NoFilesInDirectoryException, FileNotFoundException {
        if(correctionsDirectory != null){
            File[] correctionDirectories = correctionsDirectory.listFiles((dir, name) -> name.matches("[0-9]+"));

            if (correctionDirectories != null && correctionDirectories.length>0) {
                tv_corrections.getItems().clear();
                corrections.clear();

                for (File correctionDirectory : correctionDirectories) {
                    try {
                        File ratingFile = getRatingFileFromDirectory(correctionDirectory);
                        Correction c;
                        try {
                            c = RatingFileParser.parseFile(ratingFile.getAbsolutePath());
                        } catch (IOException | ParseRatingFileException e) {
                            c = new Correction();
                            c.setState(Correction.CorrectionState.PARSE_ERROR);
                            c.setPath(ratingFile.getAbsolutePath());
                            c.setId(correctionDirectory.getName());
                        } catch (FileNotInitializedException e) {
                            c = new Correction();
                            c.setState(Correction.CorrectionState.NOT_INITIALIZED);
                            c.setPath(ratingFile.getAbsolutePath());
                            c.setId(correctionDirectory.getName());
                        }
                        corrections.add(c);

                    } catch (FileNotFoundException e) {
                        errorDialog("Bewertungsdatei nicht gefunden","Die Bewertungsdatei konnte im Verzeichnis \"" + correctionDirectory.getAbsolutePath() + "\" nicht gefunden werden!");
                    } catch (RatingFileNotUniqueException e) {
                        errorDialog("Mehrere Bewertungsdateien", "Es befinden sich mehrere Bewertungsdateien im Verzeichnis\"" + correctionDirectory.getAbsolutePath() + "\"!");
                    }
                }

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
                throw new NoFilesInDirectoryException(correctionsDirectory);
            }
        }else{
            throw new FileNotFoundException();
        }
    }

    private void errorDialog(String title, String message){
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }



    private void notAllFilesInitializedDialog(){
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
            }else {
                c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
                ((Button) actionEvent.getSource()).setText("Markierung entfernen");
            }

            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,false)){
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

            try {
                RatingFileParser.saveRatingFile(c);
            } catch (IOException e) {
                e.printStackTrace();
            }

            if (c.getState() == Correction.CorrectionState.TODO) {
                c.setState(Correction.CorrectionState.FINISHED);
            }

            if(tv_corrections.getItems().indexOf(c) == tv_corrections.getItems().size()-1){
                corrections.filtered(correction -> (correction.getState() == Correction.CorrectionState.TODO || correction.getState() == Correction.CorrectionState.MARKED_FOR_LATER)).stream().findFirst().ifPresent(obj -> {
                    tv_corrections.getSelectionModel().select(obj);
                    int index = tv_corrections.getItems().indexOf(obj);
                    scrollToIndex(index, 3);
                });
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

    private static void zipFile(File fileToZip, String fileName, ZipOutputStream zipOut) throws IOException {
        if (fileToZip.isHidden()) {
            return;
        }
        if (fileToZip.isDirectory()) {
            if (fileName.endsWith("/")) {
                zipOut.putNextEntry(new ZipEntry(fileName));
                zipOut.closeEntry();
            } else {
                zipOut.putNextEntry(new ZipEntry(fileName + "/"));
                zipOut.closeEntry();
            }
            File[] children = fileToZip.listFiles();
            for (File childFile : children) {
                zipFile(childFile, fileName + "/" + childFile.getName(), zipOut);
            }
            return;
        }
        FileInputStream fis = new FileInputStream(fileToZip);
        ZipEntry zipEntry = new ZipEntry(fileName);
        zipOut.putNextEntry(zipEntry);
        byte[] bytes = new byte[1024];
        int length;
        while ((length = fis.read(bytes)) >= 0) {
            zipOut.write(bytes, 0, length);
        }
        fis.close();
    }

    public void listFiles(String directoryName, ArrayList<File> files, FileFilter fileFilter) {
        File directory = new File(directoryName);
        File[] fList = directory.listFiles((dir, name) -> !name.contains("__MACOSX"));

        files.addAll(Arrays.stream(Objects.requireNonNull(directory.listFiles(fileFilter))).filter(file -> !file.getName().contains("bewertung")).collect(Collectors.toList()));

        if(fList != null) {
            for (File file : fList) {
                if (!file.isFile()) {
                    if (file.isDirectory()) {
                        listFiles(file.getAbsolutePath(), files, fileFilter);
                    }
                }
            }
        }
    }

    private void exportAsZipWithFileChooser(){
        FileChooser choose = new FileChooser();
        choose.setTitle("Abgaben als Zip speichern");
        choose.getExtensionFilters().add(new FileChooser.ExtensionFilter("Zip Datei(*.zip)", "*.zip"));

        if(correctionsDirectory!=null){
            choose.setInitialDirectory(correctionsDirectory.getParentFile());
            if(corrections != null && corrections.get(0) != null){
                choose.setInitialFileName(("Korrektur_" + corrections.get(0).getLecture() + "_" + corrections.get(0).getExerciseSheet()).replace(" ", "_"));
            }else{
                choose.setInitialFileName(correctionsDirectory.getName());
            }
        }

        File f = choose.showSaveDialog(primaryStage);

        if(f != null){
            if(!f.getName().contains(".")) {
                f = new File(f.getAbsolutePath() + ".zip");
            }
            exportAsZip(f);
        }
    }


    private void exportAsZip(File file){
        try {
            if(correctionsDirectory != null){
                File[] directoriesToZip = correctionsDirectory.listFiles();
                if(directoriesToZip != null){
                    List<String> directoryPathsToZip = Arrays.stream(directoriesToZip).map((File::getAbsolutePath)).collect(Collectors.toList());
                    FileOutputStream fos = new FileOutputStream(file);
                    ZipOutputStream zipOut = new ZipOutputStream(fos);

                    for (String path:directoryPathsToZip) {
                        File fileToZip = new File(path);
                        zipFile(fileToZip, fileToZip.getName(), zipOut);
                    }

                    zipOut.close();
                    fos.close();
                    System.out.println("Saved ZIP to: " + file.getAbsolutePath());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void onExportAsZIP(ActionEvent actionEvent) {
        exportAsZipWithFileChooser();
    }

    public void onSaveCorrection(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c ->{
            try {
                RatingFileParser.saveRatingFile(c);
            } catch (IOException e) {
                e.printStackTrace();
            }
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

    public void onInitializeCommentSection(ActionEvent actionEvent) {
        initializeCommentSectionDialog();
    }

    public void onToggleAutosave(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.AUTOSAVE_PREF, mi_autosave.isSelected());
    }

    public void onToggleFullscreen(ActionEvent actionEvent) {
        primaryStage.setFullScreen(btn_fullscreen.isSelected());
        preferences.putBoolean(PreferenceKeys.FULLSCREEN_PREF, btn_fullscreen.isSelected());
    }

    public void onExit(ActionEvent actionEvent) {
        Platform.exit();
        System.exit(0);
    }

    public void onToggleVerbose(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.VERBOSE_PREF, ((CheckMenuItem)actionEvent.getSource()).isSelected());
    }

    public void onToggleAutoscrollTop(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF,((CheckMenuItem)actionEvent.getSource()).isSelected());
    }
}

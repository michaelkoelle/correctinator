package com.koellemichael.controller;

import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.*;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
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

    public Label lbl_directory;
    public Label lbl_info;

    public TableView tv_corrections;
    public TableColumn<Correction, String> tc_id;
    public TableColumn<Correction, String> tc_path;
    public TableColumn<Correction, Boolean> tc_changed;
    public TableColumn<Correction, Correction.CorrectionState> tc_state;
    public TableColumn<Correction, Number> tc_rating;

    public ProgressBar pb_correction;
    public Label lbl_current_id;
    public Label lbl_current_rating;
    public VBox vbox_edit;
    public Label lbl_current_max_points;
    public StackPane p_media;
    public Label lbl_current_file_max;
    public Label lbl_current_file;

    private Stage primaryStage = null;
    private boolean autosave = true;
    private ObservableList<Correction> corrections;
    private ArrayList<File> allFiles;
    private int allFilesPos;
    private File correctionsDirectory;

    public void initialize(Stage primaryStage){
        this.primaryStage = primaryStage;
        this.allFilesPos = 0;
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

        tc_id.setCellValueFactory(new PropertyValueFactory<>("id"));
        tc_path.setCellValueFactory(new PropertyValueFactory<>("path"));
        tc_rating.setCellValueFactory(cell -> cell.getValue().ratingProperty());
        tc_changed.setCellValueFactory(new PropertyValueFactory<>("changed"));
        tc_state.setCellValueFactory(new PropertyValueFactory<>("state"));

        tc_id.prefWidthProperty().bind(tv_corrections.widthProperty().divide(6));
        tc_path.prefWidthProperty().bind(tv_corrections.widthProperty().divide(6).multiply(2).subtract(20));
        tc_rating.prefWidthProperty().bind(tv_corrections.widthProperty().divide(6));
        tc_changed.prefWidthProperty().bind(tv_corrections.widthProperty().divide(6));
        tc_state.prefWidthProperty().bind(tv_corrections.widthProperty().divide(6));

        tv_corrections.getSelectionModel().selectedItemProperty().addListener(this::onSelectionChanged);
        tv_corrections.getSelectionModel().clearSelection();

        pb_correction.progressProperty().addListener(this::onProgressBarChanged);
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

    public void onOpenDirectory(ActionEvent actionEvent) {
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Abgaben öffnen");
        correctionsDirectory = chooser.showDialog(primaryStage);

        try {
            reloadRatingFiles();
            showImportSummary();

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
        Preferences preferences = Preferences.userRoot();
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
                //TODO entfernen
                lbl_directory.setText(correctionsDirectory.getAbsolutePath());
                lbl_info.setText("Es wurden " + correctionDirectories.length + " Abgaben gefunden!");

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

    private void onSelectionChanged(ObservableValue observableValue, Object oldSelection, Object newSelection){

        if(oldSelection instanceof Correction){
            Correction c = (Correction) oldSelection;
            if(c.isChanged()){
                if(autosave){
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

            File fileDir = new File(c.getPath()).getParentFile();
            allFiles = new ArrayList<>();
            listFiles(fileDir.getAbsolutePath(), allFiles, (dir, name) -> (name.toLowerCase()).endsWith(".rtf") || (name.toLowerCase()).endsWith(".asm") || (name.toLowerCase()).endsWith(".s") || (name.toLowerCase()).endsWith(".txt") || (name.toLowerCase()).endsWith(".pdf") || (name.toLowerCase()).endsWith(".jpg") || (name.toLowerCase()).endsWith(".jpeg") || (name.toLowerCase()).endsWith(".png"));
            //listFiles(fileDir.getAbsolutePath(), allFiles, (dir, name) -> true);

            //for (File allFile : allFiles) {
            //    System.out.println(allFile.getAbsolutePath());
            //}

            lbl_current_file_max.setText(String.valueOf(allFiles.size()));
            allFilesPos = 0;
            //Show first file
            if(allFiles.size()>0){
                openMediaFile(allFiles.get(allFilesPos));
                lbl_current_file.setText(String.valueOf(allFilesPos+1));
            }

        }
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

    private void openMediaFile(File file){
        p_media.getChildren().clear();
        switch(getFileExtension(file)){
            case ".pdf": openPDF(file); break;
            case ".jpg":
            case ".jpeg":
            case ".png": openImage(file); break;
            case ".asm":
            case".s": openText(file, "text/plain"); break;
            case ".txt":
            default:
                try {
                    openText(file, Files.probeContentType(Paths.get(file.getAbsolutePath())));
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
    }

    private void openPDF(File file) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/pdfview.fxml"));
            Pane p = loader.load();
            PDFViewController controller = loader.getController();
            controller.initialize(file);
            p_media.getChildren().add(p);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    private void openText(File file, String mimeType) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/textview.fxml"));
            Pane p = loader.load();
            TextViewController controller = loader.getController();
            String contents = new String(Files.readAllBytes(file.toPath()));
            controller.initialize(contents,mimeType);
            p_media.getChildren().add(p);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    private void openImage(File file) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/imageview.fxml"));
            Pane p = loader.load();
            ImageViewController controller = loader.getController();
            controller.initialize(new Image(file.toURI().toURL().toString()));
            p_media.getChildren().add(p);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    private String getFileExtension(File file) {
        String name = file.getName();
        int lastIndexOf = name.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return ""; // empty extension
        }
        return name.substring(lastIndexOf);
    }


    public void listFiles(String directoryName, ArrayList<File> files, FilenameFilter fnf) {
        File directory = new File(directoryName);
        File[] fList = directory.listFiles((dir, name) -> !name.contains("__MACOSX"));

        files.addAll(Arrays.stream(Objects.requireNonNull(directory.listFiles(fnf))).filter(file -> !file.getName().contains("bewertung")).collect(Collectors.toList()));

        if(fList != null)
            for (File file : fList) {
                if (!file.isFile()) {
                    if (file.isDirectory()) {
                        listFiles(file.getAbsolutePath(), files, fnf);
                    }
                }
            }
    }

    public void onBack(ActionEvent actionEvent) {
        tv_corrections.getSelectionModel().selectPrevious();
    }

    public void onMarkForLater(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {
            c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
        });
    }

    public void onDone(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {
            if (c.getState() == Correction.CorrectionState.TODO) {
                c.setState(Correction.CorrectionState.FINISHED);
            }
            tv_corrections.getSelectionModel().selectNext();
        });
    }

    public void onOpenCurrentDirectory(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> DesktopApi.browse(new File(c.getPath()).getParentFile().toURI()));
    }

    public void onFilePrev(ActionEvent actionEvent) {
        int temp = allFilesPos - 1;
        if(temp>=0){
            allFilesPos--;
            openMediaFile(allFiles.get(allFilesPos));
            lbl_current_file.setText(String.valueOf(allFilesPos+1));
        }
    }

    public void onFileNext(ActionEvent actionEvent) {
        int temp = allFilesPos + 1;
        if(temp<=allFiles.size()-1){
            allFilesPos++;
            openMediaFile(allFiles.get(allFilesPos));
            lbl_current_file.setText(String.valueOf(allFilesPos+1));
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
        } catch (FileNotFoundException e) {
            e.printStackTrace();
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
}

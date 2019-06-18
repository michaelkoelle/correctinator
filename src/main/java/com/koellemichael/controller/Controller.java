package com.koellemichael.controller;

import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.*;
import javafx.beans.Observable;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

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
    private DoubleBinding progress;
    private ArrayList<File> allFiles;
    private int allFilesPos;

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


    }

    public void onOpenDirectory(ActionEvent actionEvent) {
        boolean first = true;
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Abgaben öffnen");
        File correctionsDirectory = chooser.showDialog(primaryStage);

        if(correctionsDirectory != null){
            File[] correctionDirectories = correctionsDirectory.listFiles((dir, name) -> name.matches("[0-9]+"));

            if (correctionDirectories != null && correctionDirectories.length>0) {
                lbl_directory.setText(correctionsDirectory.getAbsolutePath());
                lbl_info.setText("Es wurden " + correctionDirectories.length + " Abgaben gefunden!");


                int failedParseCount = 0;
                int notInitializedCount = 0;

                for (File correctionDirectory : correctionDirectories) {

                    File[] ratings = correctionDirectory.listFiles((dir, name) -> name.matches("bewertung_[0-9]+\\.txt"));

                    if (ratings != null && ratings.length>0) {

                        for (File rating : ratings) {
                            Correction c;
                            try {
                                c = RatingFileParser.parseFile(rating.getAbsolutePath());
                            } catch (IOException | ParseException e) {
                                //TODO user die möglichkeit geben die datei anzupassen oder zu überschrieben, evtl counter wie viele nicht geparsed werden konnten
                                failedParseCount++;
                                c = new Correction();
                                c.setState(Correction.CorrectionState.PARSE_ERROR);
                                c.setPath(rating.getAbsolutePath());
                                c.setId(correctionDirectory.getName());
                            } catch (FileNotInitializedException e) {
                                //TODO counter + initialisierungsdialog
                                notInitializedCount++;
                                c = new Correction();
                                c.setState(Correction.CorrectionState.NOT_INITIALIZED);
                                c.setPath(rating.getAbsolutePath());
                                c.setId(correctionDirectory.getName());
                            }
                            corrections.add(c);
                        }

                    }else{
                        errorDialog("Fehler", "Keine Bewertungsdatei für Abgabe " + correctionDirectory.getName() + " gefunden!");
                    }
                }

                lbl_info.setText(lbl_info.getText() + "\n" + failedParseCount + " Dateien konnten nicht vollständig geparsed werden!\n"+ notInitializedCount + " Dateien wurden noch nicht initialisiert!");

                //Progress Bar binding
                if(corrections.size()>0){
                    progress = Bindings.createDoubleBinding(()-> corrections.stream().mapToDouble((c) -> (c.getState() == Correction.CorrectionState.FINISHED)?1:0).average().getAsDouble(), corrections);
                    pb_correction.progressProperty().bind(progress);

                    tv_corrections.setItems(corrections);

                    tv_corrections.getSelectionModel().selectedItemProperty().addListener(this::onSelectionChanged);

                    tv_corrections.getSelectionModel().clearSelection();
                    tv_corrections.getSelectionModel().selectFirst();
                }

                if(notInitializedCount>0){
                    Alert d = new Alert(Alert.AlertType.WARNING);
                    d.setTitle("Kommentarsektion initialisieren");
                    d.setHeaderText("Einige Dateien wurden noch nicht initialisiert.");
                    d.setContentText("Möchten Sie sie jetzt initialisieren?");
                    d.getButtonTypes().clear();
                    d.getButtonTypes().addAll(ButtonType.CANCEL,ButtonType.YES);
                    Optional<ButtonType> res =  d.showAndWait();

                    res.ifPresent(type -> {
                        if(type == ButtonType.YES){
                            //TODO open initialisation dialog
                            System.out.println("Initialisierungsdialog");




                        }
                    });
                }

            }else{
                errorDialog("Fehler", "Keine Abgaben gefunden!");
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
                            e.printStackTrace();
                        }
                    }
                }
            }
        }

        if(newSelection instanceof Correction){
            Correction c = (Correction) newSelection;
            lbl_current_id.textProperty().bind(c.idProperty());

            /*DoubleBinding ratingBinding = Bindings.createDoubleBinding(() -> c.getExercise().getSubExercises().stream().flatMap(Utils::flatten).mapToDouble(e -> {
                if(e instanceof ExerciseRating) {
                    return ((ExerciseRating) e).getRating();
                } else {
                    return 0;
                }
            }).sum(), c.getExercise().getSubExercises());
            */
            //lbl_current_rating.textProperty().bind(Bindings.convert(ratingBinding));
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

            for (File allFile : allFiles) {
                System.out.println(allFile.getAbsolutePath());
            }

            lbl_current_file_max.setText(String.valueOf(allFiles.size()));
            allFilesPos = 0;
            //Show first file
            if(allFiles.size()>0){
                openMediaFile(allFiles.get(allFilesPos));
                lbl_current_file.setText(String.valueOf(allFilesPos+1));
            }

        }
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
                if (file.isFile()) {
                    //files.add(file);
                } else if (file.isDirectory()) {
                    listFiles(file.getAbsolutePath(), files, fnf);
                }
            }
    }

    public void onBack(ActionEvent actionEvent) {
        tv_corrections.getSelectionModel().selectPrevious();
    }

    public void onMarkForLater(ActionEvent actionEvent) {
        Correction c = (Correction) tv_corrections.getSelectionModel().getSelectedItem();
        c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
    }

    public void onDone(ActionEvent actionEvent) {
        Correction c = (Correction) tv_corrections.getSelectionModel().getSelectedItem();
        if(c.getState()== Correction.CorrectionState.TODO){
            c.setState(Correction.CorrectionState.FINISHED);
        }
        tv_corrections.getSelectionModel().selectNext();
    }

    public void onOpenCurrentDirectory(ActionEvent actionEvent) {
        Correction c = (Correction) tv_corrections.getSelectionModel().getSelectedItem();
        DesktopApi.browse(new File(c.getPath()).getParentFile().toURI());

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


}

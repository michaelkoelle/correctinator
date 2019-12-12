package com.koellemichael.controller;

import com.koellemichael.model.Correction;
import com.koellemichael.model.Exercise;
import com.koellemichael.model.ExerciseRating;
import com.koellemichael.utils.*;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.stage.*;
import org.mozilla.universalchardet.UniversalDetector;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.*;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class MenuController {

    public MenuItem mi_set_todo;
    public MenuItem mi_set_marked;
    public MenuItem mi_set_finished;
    public MenuItem mi_autocomment_settings;
    public MenuItem mi_open_corrections;

    public Menu mi_state_change;
    public MenuItem mi_save_current_correction;
    public MenuItem mi_export_zip;
    public MenuItem mi_initialize;
    public MenuItem mi_save_all;

    public CheckMenuItem mi_autosave;
    public CheckMenuItem mi_fullscreen;
    public CheckMenuItem mi_verbose;
    public CheckMenuItem mi_autoscroll_top;
    public CheckMenuItem mi_cycle_files;
    public CheckMenuItem mi_auto_comment;
    public CheckMenuItem mi_wrap_text;

    private Stage primaryStage;
    private Preferences preferences;
    private Controller mainController;

    public void initialize(Stage primaryStage, Controller mainController){
        this.primaryStage = primaryStage;
        this.preferences = Preferences.userRoot();
        this.mainController = mainController;

        initCheckMenuItemValues();
        menuDisable();

        mainController.corrections.addListener((ListChangeListener) c -> {
            while(c.next()){
                menuDisable();
            }
        });

    }

    private void menuDisable(){
        if(!mainController.corrections.isEmpty()){
            mi_initialize.setDisable(false);
            mi_save_current_correction.setDisable(false);
            mi_export_zip.setDisable(false);
            mi_state_change.setDisable(false);
            mi_save_all.setDisable(false);
        }else{
            mi_initialize.setDisable(true);
            mi_save_current_correction.setDisable(true);
            mi_export_zip.setDisable(true);
            mi_state_change.setDisable(true);
            mi_save_all.setDisable(true);
        }
    }

    public void onOpenDirectory(ActionEvent actionEvent) {
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Abgaben öffnen");
        mainController.correctionsDirectory = chooser.showDialog(primaryStage);
        preferences.put(PreferenceKeys.LAST_OPENED_DIR_PREF, mainController.correctionsDirectory.getAbsolutePath());
        mainController.openCorrections();
    }

    public void onToggleCycleFiles(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.CYCLE_FILES_PREF,((CheckMenuItem) actionEvent.getSource()).isSelected());
    }

    public void onSaveAllCorrections(ActionEvent actionEvent) {
        saveAllCorrections();
    }

    private void saveAllCorrections(){
        mainController.corrections.forEach(c -> {
            try {
                Uni2WorkParser.saveRatingFile(c);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public void onAutocommentSettings(ActionEvent actionEvent) {
        Stage s = new Stage();
        s.initModality(Modality.APPLICATION_MODAL);
        s.initOwner(primaryStage);

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/layout/autocomment.fxml"));
            Pane p = loader.load();
            AutocommentController controller = loader.getController();
            controller.initialize(s,mainController.corrections);
            s.setScene(new Scene(p));
            s.showAndWait();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    public void onInitializeCommentSection(ActionEvent actionEvent) {
        mainController.initializeCommentSectionDialog();
    }

    public void onToggleAutosave(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.AUTOSAVE_PREF, mi_autosave.isSelected());
    }

    public void onToggleFullscreen(ActionEvent actionEvent) {
        primaryStage.setFullScreen(mi_fullscreen.isSelected());
        preferences.putBoolean(PreferenceKeys.FULLSCREEN_PREF, mi_fullscreen.isSelected());
    }

    public void onExit(ActionEvent actionEvent) {
        Window window = primaryStage.getScene().getWindow();
        window.fireEvent(new WindowEvent(window, WindowEvent.WINDOW_CLOSE_REQUEST));
    }

    public void onToggleVerbose(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.VERBOSE_PREF, ((CheckMenuItem)actionEvent.getSource()).isSelected());
    }

    public void onToggleAutoscrollTop(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF,((CheckMenuItem)actionEvent.getSource()).isSelected());
    }

    public void onSetTODO(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {
            c.setState(Correction.CorrectionState.TODO);
            mainController.sp_note.setManaged(false);
            c.setChanged(true);
            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                try {
                    Uni2WorkParser.saveRatingFile(c);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

        });
    }

    public void onSetMarked(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {
            c.setState(Correction.CorrectionState.MARKED_FOR_LATER);
            mainController.sp_note.setManaged(true);
            c.setChanged(true);
            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                try {
                    Uni2WorkParser.saveRatingFile(c);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

        });
    }

    public void onSetFinished(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c -> {
            c.setState(Correction.CorrectionState.FINISHED);
            mainController.sp_note.setManaged(false);
            c.setChanged(true);
            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                try {
                    Uni2WorkParser.saveRatingFile(c);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

        });
    }

    public void onSaveCorrection(ActionEvent actionEvent) {
        getSelectedCorrection().ifPresent(c ->{
            try {
                Uni2WorkParser.saveRatingFile(c);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public Optional<Correction> getSelectedCorrection(){
        Correction c = (Correction) mainController.tv_corrections.getSelectionModel().getSelectedItem();
        if(c != null){
            return Optional.of(c);
        }else{
            return Optional.empty();
        }
    }

    public void onExportAsZIP(ActionEvent actionEvent) {
        if(mainController.corrections.filtered(c -> (c.getState() != Correction.CorrectionState.FINISHED)).isEmpty()){
            FileUtils.exportAsZipWithFileChooser(mainController.correctionsDirectory,mainController.correctionsDirectory.getParentFile(),("Korrektur_" + mainController.corrections.get(0).getLecture() + "_" + mainController.corrections.get(0).getExerciseSheet()).replace(" ", "_"),primaryStage);

        }else{
            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.setTitle("Unfertige Abgaben");
            alert.setHeaderText("Einige Abgaben sind noch noch nicht fertig korrigiert oder beinhalten Fehler.");
            alert.setContentText("Möchten Sie die Abgaben trotzdem exportieren?");

            Optional<ButtonType> result = alert.showAndWait();
            if (result.isPresent() && result.get() == ButtonType.OK){
                mainController.corrections.forEach(c -> {
                    try {
                        if(c.getState()== Correction.CorrectionState.TODO || c.getState() == Correction.CorrectionState.MARKED_FOR_LATER){
                            c.setState(Correction.CorrectionState.FINISHED);
                            Uni2WorkParser.saveRatingFile(c);
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
            }

            if(result.isPresent() && result.get()==ButtonType.CANCEL){
                mainController.showUnfinishedCorrection();
            }
        }

    }

    public void onToggleAutoComment(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.AUTOCOMMENT_PREF, ((CheckMenuItem)actionEvent.getSource()).isSelected());
    }

    public void onToggleWrapText(ActionEvent actionEvent) {
        preferences.putBoolean(PreferenceKeys.WRAP_TEXT_PREF, ((CheckMenuItem)actionEvent.getSource()).isSelected());
    }

    public void onCheckForUpdates(ActionEvent actionEvent) {
        try {
            if(Utils.isNewerVersionAvailiable()){
                Dialogs.showNewerVersionAvailableDialog();
            }else{
                Dialogs.showNoNewerVersionAvailableDialog();
            }
        } catch (IOException e) {
            Dialogs.showNoInternetConnectionDialog();
        }
    }

    public void onOpenDocs(ActionEvent actionEvent) {
        Utils.openWebsite("https://github.com/koellemichael/correctinator");
    }

    public void onResetToDefaultSettings(ActionEvent actionEvent) {
        Dialogs.showAreYouSureDialog("Wollen Sie wirklich alle Einstellungen zurücksetzen?", () -> {
            preferences.putBoolean(PreferenceKeys.AUTOSAVE_PREF, true);
            preferences.putBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF, true);
            preferences.putBoolean(PreferenceKeys.CYCLE_FILES_PREF, false);
            preferences.putBoolean(PreferenceKeys.AUTOCOMMENT_PREF, true);
            preferences.putBoolean(PreferenceKeys.VERBOSE_PREF, false);
            preferences.putBoolean(PreferenceKeys.FULLSCREEN_PREF, false);
            preferences.putBoolean(PreferenceKeys.WRAP_TEXT_PREF, false);
            initCheckMenuItemValues();
        });
    }

    private void initCheckMenuItemValues() {
        mi_autosave.setSelected(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF, true));
        mi_autoscroll_top.setSelected(preferences.getBoolean(PreferenceKeys.AUTOSCROLL_TOP_PREF, true));
        mi_cycle_files.setSelected(preferences.getBoolean(PreferenceKeys.CYCLE_FILES_PREF, false));
        mi_auto_comment.setSelected(preferences.getBoolean(PreferenceKeys.AUTOCOMMENT_PREF, true));
        mi_verbose.setSelected(preferences.getBoolean(PreferenceKeys.VERBOSE_PREF,false));
        mi_fullscreen.setSelected(preferences.getBoolean(PreferenceKeys.FULLSCREEN_PREF,false));
        mi_wrap_text.setSelected(preferences.getBoolean(PreferenceKeys.WRAP_TEXT_PREF,false));
    }

    public void onResetProgramData(ActionEvent actionEvent) {
        Dialogs.showAreYouSureDialog("Wollen Sie wirklich alle Programmdaten löschen?", () -> {
            try {
                preferences.clear();
                initCheckMenuItemValues();
            } catch (BackingStoreException e) {
                e.printStackTrace();
            }
        });
    }



    public void onAutoCorrection(ActionEvent actionEvent) {
        Alert initDialog = new Alert(Alert.AlertType.CONFIRMATION);
        initDialog.setTitle("Automatische Korrektur");
        initDialog.setHeaderText("Automatische Korrektur von Single Choice Aufgaben");
        initDialog.getButtonTypes().clear();
        initDialog.getButtonTypes().add(ButtonType.CANCEL);
        initDialog.getButtonTypes().add(ButtonType.FINISH);
        TextArea textArea = new TextArea();

        ObservableList<String> list = FXCollections.observableArrayList(mainController.corrections.get(0).getExercise().getSubExercises().stream().flatMap(Utils::flatten).filter(exercise -> exercise instanceof ExerciseRating).map(Exercise::getName).collect(Collectors.toList()));
        ChoiceBox<String> choiceBox = new ChoiceBox<>(list);
        choiceBox.getSelectionModel().selectLast();

        VBox vBox = new VBox(choiceBox, textArea);
        textArea.setText(preferences.get(PreferenceKeys.SINGLE_CHOICE_SOLUTION, ""));
        initDialog.getDialogPane().setContent(vBox);
        Optional<ButtonType> b = initDialog.showAndWait();
        b.ifPresent(buttonType -> {
            if(buttonType==ButtonType.FINISH){
                int[] autoCorrectionCount = {0};
                String solution = textArea.getText();
                preferences.put(PreferenceKeys.SINGLE_CHOICE_SOLUTION, solution);

                Pattern p = Pattern.compile("(\\w)[.|\\)]\\s*\\(?([i|v|x|\\d]+)\\)?(?> *(.*))?",Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
                Pattern pSol = Pattern.compile("(\\w)[.|\\)][ |\\t]*\\(?([i|v|x|\\d]+)\\)?",Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
                Pattern pBlock = Pattern.compile("(?>(?>\\w[.|\\)][ |\\t]*\\(?[i|v|x|\\d]+\\)?.*)\\s*)+",Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
                Matcher matcher = p.matcher(solution);
                Map<String, String> solutionMap = new HashMap<>();
                Map<String, String> solutionTextMap = new HashMap<>();
                while(matcher.find()){
                    String task = matcher.group(1);
                    String sol = matcher.group(2);
                    String solText = matcher.group(3);

                    solutionMap.put(task.toLowerCase(), sol.toLowerCase());
                    solutionTextMap.put(task.toLowerCase(), solText);
                }

                mainController.corrections.forEach((c) -> {
                    ArrayList<File> files = mainController.getSolutionsFromCorrection(c);
                    final int[] found = {0};
                    Map<String, String> submission = new HashMap<>();

                    files.forEach(f -> {
                        if(FileUtils.getFileExtension(f).equals("txt")){
                            //Determine Encoding
                            String encoding = null;
                            try {
                                encoding = UniversalDetector.detectCharset(f);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            if(encoding == null){
                                encoding = Charset.defaultCharset().toString();
                            }
                            String contents = FileUtils.readStringFromFile(f, encoding);

                            Matcher matcherBlock = pBlock.matcher(contents);

                            String longestBlock = "";
                            long groups = 0;

                            while(matcherBlock.find()){
                                String block = matcherBlock.group(0);
                                System.out.println(block);

                                Matcher matcher1 = pSol.matcher(block);
                                Map<String, String> submissionTemp = new HashMap<>();
                                while(matcher1.find()){
                                    String task = matcher1.group(1);
                                    String sol = matcher1.group(2);
                                    submissionTemp.put(task.toLowerCase(), sol.toLowerCase());
                                }

                                System.out.println(submissionTemp.toString() + " Count:" + submissionTemp.size());

                                if( submissionTemp.size() > groups){
                                    longestBlock = block;
                                    groups = submissionTemp.size();
                                }

                            }
                            System.out.println("Longest Block: " + longestBlock);
                            System.out.println("########################################");

                            boolean foundMatch = false;
                            Matcher matcher1 = pSol.matcher(longestBlock);
                            Map<String, String> submissionTemp = new HashMap<>();
                            while(matcher1.find()){
                                foundMatch = true;
                                String task = matcher1.group(1);
                                String sol = matcher1.group(2);

                                if(Utils.isInteger(sol)){
                                    sol = RomanNumber.toRoman(Integer.parseInt(sol));
                                }
                                submissionTemp.put(task.toLowerCase(), sol.toLowerCase());
                            }

                            if(submissionTemp.size() > submission.size()){
                                submission.clear();
                                submission.putAll(submissionTemp);
                            }

                            if(foundMatch){
                                found[0]++;
                            }
                        }
                    });



                    if(!submission.isEmpty()){
                        System.out.println(Arrays.asList(submission));
                        double[] score = {0.0};
                        Map<String,Boolean> incorrectOrMissingTasks = new HashMap<>(); //false = incorrect, true = missing

                        solutionMap.forEach((k,v) ->{
                            if(submission.containsKey(k)){
                                if(v.equals(submission.get(k))){
                                    score[0] += 1.0;
                                }else{
                                    incorrectOrMissingTasks.put(k,false);
                                }
                            } else {
                                incorrectOrMissingTasks.put(k,true);
                            }
                        });

                        Optional<Exercise> e = c.getExercise().getSubExercises().stream().flatMap(Utils::flatten).filter(exercise -> exercise instanceof ExerciseRating && exercise.getName().equals(choiceBox.getValue())).findFirst();
                        if(e.isPresent()){
                            ExerciseRating exercise = (ExerciseRating) e.get();
                            exercise.setAutoGen(true);
                            exercise.ratingProperty().set(score[0]);
                            String imTasks = incorrectOrMissingTasks.entrySet().stream().sorted(Map.Entry.comparingByKey()).map((entry) -> {
                                boolean missing = entry.getValue();
                                String task = entry.getKey();
                                if(!missing){
                                    return task + ") " + solutionMap.get(task)+ " " + solutionTextMap.get(task);
                                }else{
                                    return task + ") fehlt";
                                }
                            }).reduce("", (s, acc) -> s + acc +  "\n");
                            exercise.commentProperty().set(imTasks);
                            c.setChanged(true);

                            autoCorrectionCount[0]++;

                            if(preferences.getBoolean(PreferenceKeys.AUTOSAVE_PREF,true)){
                                try {
                                    Uni2WorkParser.saveRatingFile(c);
                                } catch (IOException ex) {
                                    ex.printStackTrace();
                                }
                            }


                        }

                    }

                });

                if(autoCorrectionCount[0]>0){
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Zusammenfassung");
                    alert.setHeaderText(null);
                    StringBuilder content = new StringBuilder();

                    content.append("Es wurde die ").append(choiceBox.getValue().replace(":","").replace(")","")).append(" bei ").append(autoCorrectionCount[0]).append(" Abgaben automatisch korrigiert!");

                    alert.setContentText(content.toString());
                    alert.showAndWait();
                }
            }
        });
    }
}

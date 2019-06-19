package com.koellemichael.controller;

import com.koellemichael.utils.DesktopApi;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;

public class MediaViewController {
    public StackPane p_media;
    public Label lbl_current_file_max;
    public Label lbl_current_file;
    private ArrayList<File> allFiles;
    private int allFilesPos;
    private Controller controller;

    public void initialize(Controller controller){
        this.controller = controller;
        this.allFilesPos = 0;

        this.controller.getSelectedCorrection().ifPresent(c ->{
            File fileDir = new File(c.getPath()).getParentFile();
            allFiles = new ArrayList<>();
            listFiles(fileDir.getAbsolutePath(), allFiles, (dir, name) -> (name.toLowerCase()).endsWith(".rtf") || (name.toLowerCase()).endsWith(".asm") || (name.toLowerCase()).endsWith(".s") || (name.toLowerCase()).endsWith(".txt") || (name.toLowerCase()).endsWith(".pdf") || (name.toLowerCase()).endsWith(".jpg") || (name.toLowerCase()).endsWith(".jpeg") || (name.toLowerCase()).endsWith(".png"));

            lbl_current_file_max.setText(String.valueOf(allFiles.size()));
            allFilesPos = 0;

            //Show first file
            if(allFiles.size()>0){
                openMediaFile(allFiles.get(allFilesPos));
                lbl_current_file.setText(String.valueOf(allFilesPos+1));
            }
        });

    }

    public void onOpenCurrentDirectory(ActionEvent actionEvent) {
        this.controller.getSelectedCorrection().ifPresent(c -> DesktopApi.browse(new File(c.getPath()).getParentFile().toURI()));
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

}

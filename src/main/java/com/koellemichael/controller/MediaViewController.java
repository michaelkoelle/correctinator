package com.koellemichael.controller;

import com.koellemichael.utils.DesktopApi;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;

public class MediaViewController {
    public StackPane p_media;
    public Label lbl_current_file_max;
    public Label lbl_current_file;
    private int allFilesPos;
    private ArrayList<File> files;

    public void initialize(ArrayList<File> files){
        this.files = files;
        this.allFilesPos = 0;
        lbl_current_file_max.setText(String.valueOf(this.files.size()));

        //Show first file
        if(this.files.size()>0){
            openMediaFile(this.files.get(allFilesPos));
            lbl_current_file.setText(String.valueOf(allFilesPos+1));
        }

    }

    public void onOpenCurrentDirectory(ActionEvent actionEvent) {
        DesktopApi.browse(files.get(allFilesPos).getParentFile().toURI());
    }

    public void onFilePrev(ActionEvent actionEvent) {
        int temp = allFilesPos - 1;
        if(temp>=0){
            allFilesPos--;
            openMediaFile(files.get(allFilesPos));
            lbl_current_file.setText(String.valueOf(allFilesPos+1));
        }
    }

    public void onFileNext(ActionEvent actionEvent) {
        int temp = allFilesPos + 1;
        if(temp<=files.size()-1){
            allFilesPos++;
            openMediaFile(files.get(allFilesPos));
            lbl_current_file.setText(String.valueOf(allFilesPos+1));
        }
    }

    private void openMediaFile(File file){
        p_media.getChildren().clear();
        try {
            String mimeType = Files.probeContentType(Paths.get(file.toURI()));
            switch (mimeType){
                case "application/pdf": openPDF(file); break;
                case "image/bmp":
                case "image/gif":
                case "image/jpeg":
                case "image/png":
                case "image/svg+xml":
                case "image/tiff": openImage(file); break;
                case "text/css":
                case "text/html":
                case "text/javascript":
                case "text/plain":
                case "text/richtext":
                case "text/rtf":
                case "text/tab-separated-values":
                case "text/comma-separated-values":
                case "text/xml":
                default: openText(file,mimeType);
            }
        } catch (IOException ignored) {}
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

    public void onReloadFile(ActionEvent actionEvent) {
        openMediaFile(files.get(allFilesPos));
    }
}

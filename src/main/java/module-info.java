module com.koellemichael {
    requires javafx.controls;
    requires javafx.base;
    requires javafx.media;
    requires javafx.fxml;
    requires javafx.web;
    requires javafx.graphics;
    requires java.desktop;
    requires java.sql;
    requires java.prefs;
    requires maven.model;
    exports com.koellemichael;
    exports com.koellemichael.controller;
    exports com.koellemichael.model;
    exports com.koellemichael.utils;
    exports com.koellemichael.exceptions;
}
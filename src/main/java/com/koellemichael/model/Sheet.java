package com.koellemichael.model;

import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;

public class Sheet {
    private SimpleStringProperty name;
    private SimpleStringProperty type;
    private SimpleObjectProperty<Grading> grading;

    public Sheet() {
        this.name = new SimpleStringProperty("");
        this.type = new SimpleStringProperty("");
        this.grading = new SimpleObjectProperty<>(new Grading(0,""));
    }

    public Sheet(String name, String type, Grading grading) {
        this.name = new SimpleStringProperty(name);
        this.type = new SimpleStringProperty(type);
        this.grading = new SimpleObjectProperty<>(grading);
    }

    public String getName() {
        return name.get();
    }

    public SimpleStringProperty nameProperty() {
        return name;
    }

    public void setName(String name) {
        this.name.set(name);
    }

    public String getType() {
        return type.get();
    }

    public SimpleStringProperty typeProperty() {
        return type;
    }

    public void setType(String type) {
        this.type.set(type);
    }

    public Grading getGrading() {
        return grading.get();
    }

    public SimpleObjectProperty<Grading> gradingProperty() {
        return grading;
    }

    public void setGrading(Grading grading) {
        this.grading.set(grading);
    }
}

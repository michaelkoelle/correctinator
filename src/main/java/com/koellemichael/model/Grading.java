package com.koellemichael.model;

import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.property.SimpleStringProperty;

public class Grading {
    private SimpleDoubleProperty max;
    private SimpleStringProperty type;

    public Grading() {
        this.max = new SimpleDoubleProperty(0);
        this.type = new SimpleStringProperty("");
    }

    public Grading(double max, String type) {
        this.max = new SimpleDoubleProperty(max);
        this.type = new SimpleStringProperty(type);
    }

    public double getMax() {
        return max.get();
    }

    public SimpleDoubleProperty maxProperty() {
        return max;
    }

    public void setMax(double max) {
        this.max.set(max);
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
}

package com.koellemichael.model;

public class Sheet1 {
    public String name;
    public String type;
    public Grading1 grading;

    public Sheet1() {
    }

    public Sheet1(String name, String type, Grading1 grading) {
        this.name = name;
        this.type = type;
        this.grading = grading;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Grading1 getGrading() {
        return grading;
    }

    public void setGrading(Grading1 grading) {
        this.grading = grading;
    }
}

package com.koellemichael.model;

public class Grading1 {
    public Double max;
    public String type;

    public Grading1() {
    }

    public Grading1(double max, String type) {
        this.max = max;
        this.type = type;
    }

    public double getMax() {
        return max;
    }

    public void setMax(double max) {
        this.max = max;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

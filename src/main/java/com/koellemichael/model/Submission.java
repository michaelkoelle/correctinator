package com.koellemichael.model;

public class Submission {
    public String term;
    public String school;
    public String course;
    public Sheet1 sheet;
    public String rated_by;
    public String rated_at;
    public String submission;
    public Double points;
    public Boolean rating_done;

    public Submission() {
    }

    public Submission(String term, String school, String course, Sheet1 sheet, String rated_by, String rated_at, String submission, double points, boolean rating_done) {
        this.term = term;
        this.school = school;
        this.course = course;
        this.sheet = sheet;
        this.rated_by = rated_by;
        this.rated_at = rated_at;
        this.submission = submission;
        this.points = points;
        this.rating_done = rating_done;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Sheet1 getSheet() {
        return sheet;
    }

    public void setSheet(Sheet1 sheet) {
        this.sheet = sheet;
    }

    public String getRated_by() {
        return rated_by;
    }

    public void setRated_by(String rated_by) {
        this.rated_by = rated_by;
    }

    public String getRated_at() {
        return rated_at;
    }

    public void setRated_at(String rated_at) {
        this.rated_at = rated_at;
    }

    public String getSubmission() {
        return submission;
    }

    public void setSubmission(String submission) {
        this.submission = submission;
    }

    public Double getPoints() {
        return points;
    }

    public void setPoints(Double points) {
        this.points = points;
    }

    public Boolean getRating_done() {
        return rating_done;
    }

    public void setRating_done(Boolean rating_done) {
        this.rating_done = rating_done;
    }
}

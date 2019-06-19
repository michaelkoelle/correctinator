package com.koellemichael.utils;

public class ParseRatingFileException extends Exception {

    public ParseRatingFileException(String string) {
        super("Could not parse string: " + string);
    }

}

package com.koellemichael.exceptions;

public class ParseRatingFileException extends Exception {

    public ParseRatingFileException(String string) {
        super("Could not parse string: " + string);
    }

}

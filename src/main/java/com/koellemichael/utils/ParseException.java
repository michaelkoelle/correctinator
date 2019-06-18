package com.koellemichael.utils;

public class ParseException extends Exception {

    public ParseException(String string) {
        super("Could not parse string: " + string);
    }

}

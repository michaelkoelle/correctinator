package com.koellemichael.exceptions;

import java.io.File;

public class RatingFileNotUniqueException extends Exception {
    public RatingFileNotUniqueException(File dir) {
        super("Rating file not unique in directory: " + dir.getAbsolutePath());
    }
}

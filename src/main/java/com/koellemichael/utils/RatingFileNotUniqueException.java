package com.koellemichael.utils;

import java.io.File;

public class RatingFileNotUniqueException extends Exception {
    public RatingFileNotUniqueException(File dir) {
        super("Rating file not unique in directory: " + dir.getAbsolutePath());
    }
}

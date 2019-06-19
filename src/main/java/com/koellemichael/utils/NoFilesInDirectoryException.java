package com.koellemichael.utils;

import java.io.File;

public class NoFilesInDirectoryException extends Exception {
    public NoFilesInDirectoryException(File file) {
        super("Es wurden Abgaben im Verzeichnis gefunden: " + file.getAbsolutePath());
    }
}

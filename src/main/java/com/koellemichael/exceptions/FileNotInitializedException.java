package com.koellemichael.exceptions;

public class FileNotInitializedException extends Exception{
    public FileNotInitializedException() {
        super("File is not initialized!");
    }
}

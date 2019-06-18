package com.koellemichael.utils;

public class FileNotInitializedException extends Exception{
    public FileNotInitializedException() {
        super("File is not initialized!");
    }
}

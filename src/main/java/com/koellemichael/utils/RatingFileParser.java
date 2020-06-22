package com.koellemichael.utils;

import com.koellemichael.model.Correction;

public interface RatingFileParser {
    static Correction parseFile(String path) { return null; }
    static void saveRatingFile(Correction c) {}
    static void initializeComments(Correction c, String init){}
}

package com.koellemichael.utils;

import com.koellemichael.model.Exercise;
import java.util.stream.Stream;

public class Utils {
    public static Stream<Exercise> flatten(Exercise exercise) {
        if(exercise != null && exercise.getSubExercises() != null){
            return Stream.concat(
                    Stream.of(exercise),
                    exercise.getSubExercises().stream().flatMap(Utils::flatten));
        }else{
            return Stream.of(exercise);
        }
    }
}

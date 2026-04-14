package org.api.quizzz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QuizzzApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizzzApplication.class, args);
    }

}

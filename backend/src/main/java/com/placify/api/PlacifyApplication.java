package com.placify.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
@EnableMongoAuditing
public class PlacifyApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(PlacifyApplication.class, args);
    }

    public static void loadDotEnv() {
        String[] potentialPaths = {".env", "backend/.env", "../.env"};
        for (String p : potentialPaths) {
            Path path = Paths.get(p).toAbsolutePath().normalize();
            if (Files.exists(path) && !Files.isDirectory(path)) {
                try (BufferedReader reader = new BufferedReader(new FileReader(path.toFile()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                } catch (Exception ignored) {
                    // Safe silent fallback - no logging of file or secrets
                }
                break;
            }
        }
    }
}

package com.example.forum.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/uploads")
public class FileController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            // Try multiple possible locations for the file
            List<Path> possiblePaths = new ArrayList<>();

            // 1. Try absolute path in the configured upload directory
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.isAbsolute()) {
                uploadDirFile = new File(System.getProperty("user.dir"), uploadDir);
            }
            possiblePaths.add(uploadDirFile.toPath().resolve(filename).normalize());

            // 2. Try relative path in the project root
            possiblePaths.add(Paths.get(uploadDir, filename).normalize());

            // 3. Try relative path in the parent directory (if running from Backend folder)
            possiblePaths.add(Paths.get("..", uploadDir, filename).normalize());

            // 4. Try absolute path from workspace root
            String workspaceRoot = System.getProperty("user.dir");
            if (workspaceRoot.endsWith("Backend")) {
                workspaceRoot = workspaceRoot.substring(0, workspaceRoot.length() - "Backend".length());
            }
            possiblePaths.add(Paths.get(workspaceRoot, uploadDir, filename).normalize());

            // Try each path until we find the file
            for (Path filePath : possiblePaths) {
                try {
                    Resource resource = new UrlResource(filePath.toUri());
                    if (resource.exists()) {
                        // Determine content type dynamically
                        String contentType = determineContentType(filename);

                        return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(contentType))
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                                .body(resource);
                    }
                } catch (MalformedURLException e) {
                    // Continue to the next path
                }
            }

            // If we get here, the file wasn't found in any of the possible locations
            System.out.println("File not found: " + filename);
            System.out.println("Tried the following paths:");
            for (Path path : possiblePaths) {
                System.out.println(" - " + path.toString());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    private String determineContentType(String filename) {
        try {
            String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            switch (extension) {
                case "png":
                    return "image/png";
                case "jpg":
                case "jpeg":
                    return "image/jpeg";
                case "gif":
                    return "image/gif";
                case "webp":
                    return "image/webp";
                default:
                    return Files.probeContentType(Paths.get(filename));
            }
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}
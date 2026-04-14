package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.service.CloudinaryService;
import org.api.quizzz.service.ExternalApiService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/external")
@RequiredArgsConstructor
public class ExternalApiController {

    private final CloudinaryService cloudinaryService;
    private final ExternalApiService externalApiService;

    // --- CLOUDINARY ---

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping(value = "/upload/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadAudio(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // --- TEXT TO SPEECH ---

    @GetMapping("/tts")
    public ResponseEntity<byte[]> getTts(
            @RequestParam("text") String text,
            @RequestParam(value = "lang", defaultValue = "en-US") String lang) {
        
        byte[] audioBytes = externalApiService.getTtsAudio(text, lang);
        
        HttpHeaders headers = new HttpHeaders();
        // Giả lập dạng mpeg/audio
        headers.setContentType(MediaType.valueOf("audio/mpeg"));
        
        return new ResponseEntity<>(audioBytes, headers, HttpStatus.OK);
    }

    // --- TRANSLATE ---

    @GetMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(
            @RequestParam("text") String text,
            @RequestParam(value = "source", defaultValue = "en") String source,
            @RequestParam(value = "target", defaultValue = "vi") String target) {
        
        String translatedText = externalApiService.translate(text, source, target);
        return ResponseEntity.ok(Map.of(
                "original", text,
                "translated", translatedText
        ));
    }

    // --- SPELL CHECK ---

    @PostMapping("/spellcheck")
    public ResponseEntity<Map<String, Object>> spellCheck(
            @RequestBody Map<String, String> request) {
        
        String text = request.getOrDefault("text", "");
        String language = request.getOrDefault("language", "en-US");
        
        return ResponseEntity.ok(externalApiService.spellCheck(text, language));
    }

    // --- WIKIPEDIA SUMMARY ---

    @GetMapping("/wikipedia")
    public ResponseEntity<Map<String, String>> getWikipediaSummary(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "lang", defaultValue = "en") String lang) {
        
        String summary = externalApiService.getWikipediaSummary(keyword, lang);
        return ResponseEntity.ok(Map.of(
                "keyword", keyword,
                "summary", summary
        ));
    }
}

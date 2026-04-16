package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.service.CloudinaryService;
import org.api.quizzz.service.ExternalApiService;
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

    // --- CLOUDINARY UPLOAD ---

    /** POST /api/external/upload/image — Upload ảnh flashcard lên Cloudinary */
    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /** POST /api/external/upload/audio — Upload audio flashcard lên Cloudinary */
    @PostMapping(value = "/upload/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadAudio(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // --- TEXT TO SPEECH ---

    /**
     * GET /api/external/tts?text=...&lang=...
     * Trả về JSON { "audioUrl": "<url>" } thay vì raw bytes
     * để frontend có thể lưu và phát lại dễ dàng.
     */
    @GetMapping("/tts")
    public ResponseEntity<Map<String, String>> getTts(
            @RequestParam("text") String text,
            @RequestParam(value = "lang", defaultValue = "en") String lang) {

        String audioUrl = externalApiService.getTtsUrl(text, lang);
        return ResponseEntity.ok(Map.of("audioUrl", audioUrl));
    }

    // --- TRANSLATE ---

    /**
     * GET /api/external/translate?text=...&from=...&to=...
     * Trả về JSON { "result": "...", "from": "...", "to": "..." }
     */
    @GetMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(
            @RequestParam("text") String text,
            @RequestParam(value = "from", defaultValue = "auto") String from,
            @RequestParam(value = "to", defaultValue = "vi") String to) {

        String translatedText = externalApiService.translate(text, from, to);
        return ResponseEntity.ok(Map.of(
                "result", translatedText,
                "from", from,
                "to", to
        ));
    }

    // --- SPELL CHECK ---

    /**
     * POST /api/external/spellcheck
     * Body: { "text": "...", "lang": "en" }
     * Trả về { "correct": bool, "suggestions": [...], "corrected": "..." }
     */
    @PostMapping("/spellcheck")
    public ResponseEntity<Map<String, Object>> spellCheck(
            @RequestBody Map<String, String> request) {

        String text = request.getOrDefault("text", "");
        String lang = request.getOrDefault("lang", "en-US");
        return ResponseEntity.ok(externalApiService.spellCheck(text, lang));
    }

    // --- WIKIPEDIA SUMMARY ---

    /**
     * GET /api/external/wikipedia?query=...&lang=...
     * Trả về { "summary": "...", "url": "..." }
     */
    @GetMapping("/wikipedia")
    public ResponseEntity<Map<String, String>> getWikipediaSummary(
            @RequestParam("query") String query,
            @RequestParam(value = "lang", defaultValue = "en") String lang) {

        String summary = externalApiService.getWikipediaSummary(query, lang);
        String wikiUrl = String.format("https://%s.wikipedia.org/wiki/%s",
                lang, query.replace(" ", "_"));
        return ResponseEntity.ok(Map.of(
                "summary", summary,
                "url", wikiUrl
        ));
    }
}

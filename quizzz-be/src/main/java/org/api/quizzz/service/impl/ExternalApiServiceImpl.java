package org.api.quizzz.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.api.quizzz.service.ExternalApiService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExternalApiServiceImpl implements ExternalApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ExternalApiServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ─────────────────────────────────────────────
    // TRANSLATE  (MyMemory free API)
    // ─────────────────────────────────────────────

    @Override
    public String translate(String text, String from, String to) {
        try {
            // MyMemory dùng cú pháp "sourceLang|targetLang"
            // "auto" không hợp lệ với MyMemory, mặc định thành "en"
            String sourceLang = "auto".equalsIgnoreCase(from) ? "en" : from;
            String url = "https://api.mymemory.translated.net/get";
            URI uri = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("q", text)
                    .queryParam("langpair", sourceLang + "|" + to)
                    .build().encode().toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("responseData").path("translatedText").asText();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kết nối dịch vụ dịch thuật: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // SPELL CHECK  (LanguageTool free API)
    // ─────────────────────────────────────────────

    @Override
    public Map<String, Object> spellCheck(String text, String language) {
        try {
            String url = "https://api.languagetool.org/v2/check";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");

            // Chuẩn hoá language code, ví dụ "en" → "en-US"
            String lang = language.contains("-") ? language : language + "-US";
            String requestBody = "text=" + URLEncoder.encode(text, StandardCharsets.UTF_8)
                    + "&language=" + URLEncoder.encode(lang, StandardCharsets.UTF_8);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode matches = root.path("matches");

            boolean correct = !matches.elements().hasNext(); // không lỗi = đúng
            List<String> suggestions = new ArrayList<>();
            String corrected = text;

            // Thu thập gợi ý từ kết quả đầu tiên
            if (matches.isArray() && matches.size() > 0) {
                JsonNode firstMatch = matches.get(0);
                JsonNode replacements = firstMatch.path("replacements");
                for (int i = 0; i < Math.min(replacements.size(), 5); i++) {
                    String suggestion = replacements.get(i).path("value").asText();
                    if (!suggestion.isBlank()) suggestions.add(suggestion);
                }
                // Áp dụng gợi ý đầu tiên để tạo "corrected"
                if (!suggestions.isEmpty()) {
                    int offset = firstMatch.path("offset").asInt();
                    int length = firstMatch.path("length").asInt();
                    if (offset >= 0 && offset + length <= text.length()) {
                        corrected = text.substring(0, offset) + suggestions.get(0)
                                + text.substring(offset + length);
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("correct", correct);
            result.put("suggestions", suggestions);
            result.put("corrected", corrected);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi check chính tả: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // WIKIPEDIA SUMMARY  (Wikipedia REST API)
    // ─────────────────────────────────────────────

    @Override
    public String getWikipediaSummary(String keyword, String language) {
        try {
            String url = String.format("https://%s.wikipedia.org/w/api.php", language);
            URI uri = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("action", "query")
                    .queryParam("prop", "extracts")
                    .queryParam("exsentences", 3)
                    .queryParam("exlimit", 1)
                    .queryParam("titles", keyword)
                    .queryParam("explaintext", 1)
                    .queryParam("format", "json")
                    .build().encode().toUri();

            // Wikipedia yêu cầu User-Agent để tránh bị block
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "QuizzzApp/1.0 (educational project; contact@quizzz.com)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode pages = root.path("query").path("pages");
            if (pages.fields().hasNext()) {
                JsonNode firstPage = pages.fields().next().getValue();
                String extract = firstPage.path("extract").asText();
                return extract.isBlank() ? "Không tìm thấy kết quả từ Wikipedia." : extract;
            }
            return "Không tìm thấy kết quả từ Wikipedia.";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kết nối Wikipedia: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // TEXT-TO-SPEECH  (Google Translate TTS public URL)
    // ─────────────────────────────────────────────

    /**
     * Trả về URL audio Google Translate TTS công khai.
     * Frontend sẽ dùng URL này để phát trực tiếp qua thẻ &lt;audio&gt;.
     * Không cần proxy qua backend.
     */
    @Override
    public String getTtsUrl(String text, String language) {
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            // Cú pháp URL TTS của Google Translate (unofficial, miễn phí)
            return String.format(
                    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=%s&q=%s",
                    URLEncoder.encode(language, StandardCharsets.UTF_8),
                    encodedText
            );
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL TTS: " + e.getMessage());
        }
    }
}

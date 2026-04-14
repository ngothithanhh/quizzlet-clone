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
import java.util.HashMap;
import java.util.Map;

@Service
public class ExternalApiServiceImpl implements ExternalApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ExternalApiServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String translate(String text, String sourceLang, String targetLang) {
        try {
            String url = "https://api.mymemory.translated.net/get";
            URI uri = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("q", text)
                    .queryParam("langpair", sourceLang + "|" + targetLang)
                    .build().encode().toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("responseData").path("translatedText").asText();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kết nối dịch vụ dịch thuật: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> spellCheck(String text, String language) {
        try {
            String url = "https://api.languagetool.org/v2/check";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");
            
            // LanguageTool API uses POST with x-www-form-urlencoded
            String requestBody = "text=" + text + "&language=" + language;
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            result.put("matches", root.path("matches")); // trả về mảng các lỗi ngữ pháp/chính tả
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi check chính tả: " + e.getMessage());
        }
    }

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

            // Wikipedia yêu cầu User-Agent để chống Bot scraping
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "QuizzzApp/1.0 (educational project; contact@quizzz.com)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode pages = root.path("query").path("pages");
            if (pages.fields().hasNext()) {
                JsonNode firstPage = pages.fields().next().getValue();
                return firstPage.path("extract").asText();
            }
            return "Không tìm thấy kết quả từ Wikipedia.";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kết nối Wikipedia: " + e.getMessage());
        }
    }

    @Override
    public byte[] getTtsAudio(String text, String language) {
        try {
            // Google Translate unofficial TTS link
            String url = "https://translate.google.com/translate_tts";
            URI uri = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("ie", "UTF-8")
                    .queryParam("client", "tw-ob")
                    .queryParam("q", text)
                    .queryParam("tl", language)
                    .build().encode().toUri();

            ResponseEntity<byte[]> response = restTemplate.getForEntity(uri, byte[].class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo giọng nói TTS: " + e.getMessage());
        }
    }
}

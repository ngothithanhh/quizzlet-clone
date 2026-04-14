package org.api.quizzz.service;

import java.util.Map;

public interface ExternalApiService {
    
    String translate(String text, String sourceLang, String targetLang);
    
    Map<String, Object> spellCheck(String text, String language);
    
    String getWikipediaSummary(String keyword, String language);

    byte[] getTtsAudio(String text, String language);
}

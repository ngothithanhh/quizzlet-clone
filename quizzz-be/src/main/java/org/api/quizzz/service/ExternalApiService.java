package org.api.quizzz.service;

import java.util.Map;

public interface ExternalApiService {

    /** Dịch văn bản từ ngôn ngữ nguồn sang ngôn ngữ đích */
    String translate(String text, String from, String to);

    /**
     * Kiểm tra chính tả — trả về Map gồm:
     *   "correct"     : boolean
     *   "suggestions" : List<String>   (các gợi ý sửa)
     *   "corrected"   : String         (văn bản đã sửa nếu có lỗi)
     */
    Map<String, Object> spellCheck(String text, String language);

    /** Tóm tắt Wikipedia theo từ khoá và ngôn ngữ */
    String getWikipediaSummary(String keyword, String language);

    /**
     * Text-to-speech — trả về URL audio (Google Translate TTS public URL)
     * để frontend phát trực tiếp qua thẻ &lt;audio&gt;.
     */
    String getTtsUrl(String text, String language);
}

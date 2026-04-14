package org.api.quizzz.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadImage(MultipartFile file);
    String uploadAudio(MultipartFile file);
}

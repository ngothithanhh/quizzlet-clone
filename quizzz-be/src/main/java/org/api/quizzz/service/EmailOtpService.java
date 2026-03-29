package org.api.quizzz.service;

import org.api.quizzz.entity.EmailOtp;
import org.api.quizzz.enums.OtpType;

public interface EmailOtpService {
    EmailOtp createAndSendOtp(String email, OtpType type);
    boolean verifyOtp(String email, OtpType type, String otpCode);


}

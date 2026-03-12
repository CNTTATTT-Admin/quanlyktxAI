package com.cntt.rentalmanagement.services;

import jakarta.mail.MessagingException;
import java.io.IOException;

public interface MailService {
    void sendEmailConfirmed(String email, String name) throws MessagingException, IOException;
    void sendEmailFromTemplate(String email) throws MessagingException, IOException;
}

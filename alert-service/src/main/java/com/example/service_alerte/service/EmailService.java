package com.example.service_alerte.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String EXPEDITEUR = "mohamedkhmili13@gmail.com"; // à remplacer

    public void envoyerAlerte(String sujet, String contenu, String destinataire) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(EXPEDITEUR);
        message.setTo(destinataire);
        message.setSubject(sujet);
        message.setText(contenu);
        mailSender.send(message);
    }
}

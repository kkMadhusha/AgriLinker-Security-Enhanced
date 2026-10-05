package com.agrilinker.backend.notifications;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.Map;

import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationSseService sse;

    public NotificationController(NotificationSseService sse) {
        this.sse = sse;
    }

    @GetMapping("/stream")
    public SseEmitter stream(
        @RequestParam String userKey,
        Principal principal) {

    String authenticatedUser = principal.getName();

    if (!authenticatedUser.equalsIgnoreCase(userKey)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    return sse.subscribe(userKey);
}
}

package com.placify.api;

import com.placify.api.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class AuthServiceTest {

    @Test
    public void testJwtGenerationAndValidation() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", 86400000);

        String token = tokenProvider.generateTokenFromUser("u123", "student@placify.edu", "Rahul", "STUDENT");
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));

        assertEquals("student@placify.edu", tokenProvider.getEmailFromToken(token));
        assertEquals("u123", tokenProvider.getUserIdFromToken(token));

        assertFalse(tokenProvider.validateToken("invalid.token.string"));
    }
}

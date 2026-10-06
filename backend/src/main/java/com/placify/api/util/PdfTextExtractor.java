package com.placify.api.util;

import com.placify.api.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class PdfTextExtractor {

    private static final Logger logger = LoggerFactory.getLogger(PdfTextExtractor.class);

    public String extractText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new BadRequestException("Uploaded PDF file is empty.");
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.isEncrypted()) {
                throw new BadRequestException("The uploaded PDF is encrypted/password-protected. Please upload an unprotected file.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().length() < 30) {
                throw new BadRequestException("Could not extract readable text from the uploaded PDF. Please make sure the resume contains selectable text (not scanned images).");
            }

            return cleanExtractedText(text);
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception ex) {
            logger.error("Failed to parse PDF document: {}", ex.getMessage());
            throw new BadRequestException("Failed to read PDF file: " + ex.getMessage());
        }
    }

    private String cleanExtractedText(String raw) {
        return raw.replaceAll("\\r\\n", "\n")
                .replaceAll("\\r", "\n")
                .replaceAll("[\\t\\x0B\\f]", " ")
                .replaceAll(" +", " ")
                .trim();
    }
}

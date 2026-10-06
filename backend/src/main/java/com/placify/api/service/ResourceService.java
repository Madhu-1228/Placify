package com.placify.api.service;

import com.placify.api.dto.ResourceRequest;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.DifficultyLevel;
import com.placify.api.model.Resource;
import com.placify.api.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources(String category, DifficultyLevel difficulty, String search) {
        List<Resource> resources = resourceRepository.findAllByOrderByCreatedAtDesc();

        return resources.stream()
                .filter(r -> {
                    if (StringUtils.hasText(category) && !category.equalsIgnoreCase("ALL")) {
                        if (r.getCategory() == null || !r.getCategory().equalsIgnoreCase(category)) {
                            return false;
                        }
                    }
                    if (difficulty != null && r.getDifficulty() != difficulty) {
                        return false;
                    }
                    if (StringUtils.hasText(search)) {
                        String s = search.toLowerCase();
                        boolean matchTitle = r.getTitle() != null && r.getTitle().toLowerCase().contains(s);
                        boolean matchDesc = r.getDescription() != null && r.getDescription().toLowerCase().contains(s);
                        boolean matchTag = r.getTags() != null && r.getTags().stream().anyMatch(t -> t.toLowerCase().contains(s));
                        return matchTitle || matchDesc || matchTag;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Resource createResource(ResourceRequest request, String createdBy) {
        Resource r = new Resource();
        r.setTitle(request.getTitle().trim());
        r.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        r.setCategory(request.getCategory().trim());
        r.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : DifficultyLevel.MEDIUM);
        r.setResourceType(request.getResourceType() != null ? request.getResourceType() : "PDF");
        r.setUrl(request.getUrl() != null ? request.getUrl().trim() : "");
        r.setContent(request.getContent() != null ? request.getContent().trim() : "");
        r.setTags(request.getTags());
        r.setCreatedBy(createdBy);
        r.setCreatedAt(Instant.now());
        r.setUpdatedAt(Instant.now());

        return resourceRepository.save(r);
    }

    public void deleteResource(String id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        resourceRepository.delete(r);
    }

    public Resource toggleResourceCompletion(String id, String userId) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        if (r.getCompletedUserIds().contains(userId)) {
            r.getCompletedUserIds().remove(userId);
        } else {
            r.getCompletedUserIds().add(userId);
        }
        r.setUpdatedAt(Instant.now());
        return resourceRepository.save(r);
    }
}

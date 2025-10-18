package com.kspk.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kspk.entity.Food;
import com.kspk.DTOs.FoodRequest;
import com.kspk.DTOs.FoodResponse;
import com.kspk.repository.FoodRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FoodServiceImpl implements FoodService {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private FoodRepository foodRepository;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("url").toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public FoodResponse addFood(FoodRequest foodRequest, MultipartFile file) {
        Food food = convertRequestIntoFood(foodRequest);
        String foodUrl = uploadFile(file);
        food.setImageUrl(foodUrl);

        foodRepository.save(food);
        return convertFoodIntoResponse(food);
    }

    @Override
    public List<FoodResponse> getFoods() {
        List<Food> foods = foodRepository.findAll();
        return foods.stream()
                .map(this::convertFoodIntoResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FoodResponse getFoodById(String id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invalid food ID: " + id));
        return convertFoodIntoResponse(food);
    }

    @Override
    public void deleteFood(String id) {
        FoodResponse foodResponse = getFoodById(id);
        String imageUrl = foodResponse.getImageUrl();

        String publicId = extractPublicIdFromUrl(imageUrl);

        boolean isFileDeleted = deleteFile(publicId);
        if (isFileDeleted) {
            foodRepository.deleteById(foodResponse.getId());
        } else {
            throw new RuntimeException("Failed to delete image from Cloudinary.");
        }
    }

    @Override
    public boolean deleteFile(String publicId) {
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper: Convert request into entity
    private Food convertRequestIntoFood(FoodRequest request) {
        return Food.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .build();
    }

    // Helper: Convert entity into response
    private FoodResponse convertFoodIntoResponse(Food food) {
        return FoodResponse.builder()
                .id(food.getId())
                .name(food.getName())
                .description(food.getDescription())
                .imageUrl(food.getImageUrl())
                .price(food.getPrice())
                .category(food.getCategory())
                .build();
    }

    // Helper: Extract public_id from full Cloudinary URL
    private String extractPublicIdFromUrl(String imageUrl) {
        // Remove query params if any
        imageUrl = imageUrl.split("\\?")[0];

        // Remove everything before /upload/
        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) return null;

        String pathAndFile = parts[1];

        // Remove version (e.g., v1234567890/)
        int slashIndex = pathAndFile.indexOf("/");
        if (slashIndex != -1) {
            pathAndFile = pathAndFile.substring(slashIndex + 1);
        }

        // Remove file extension
        if (pathAndFile.contains(".")) {
            pathAndFile = pathAndFile.substring(0, pathAndFile.lastIndexOf('.'));
        }

        return pathAndFile;
    }
}

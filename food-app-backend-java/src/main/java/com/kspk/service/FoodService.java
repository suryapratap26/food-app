package com.kspk.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.kspk.DTOs.FoodRequest;
import com.kspk.DTOs.FoodResponse;

public interface FoodService {
	
	public String uploadFile(MultipartFile file);
	
	public FoodResponse addFood(FoodRequest foodRequest,MultipartFile file);
	 
	List<FoodResponse> getFoods();
	
	FoodResponse getFoodById(String id);
	
	boolean deleteFile(String foodName);
	
	public void deleteFood(String id);
}

package com.kspk.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.kspk.entity.Food;

@Repository
public interface FoodRepository extends MongoRepository<Food, String>{

}

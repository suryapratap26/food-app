package com.kspk.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
@Document(collection="foods")
public class Food {
	@Id
	private String id;
	private String name;
	private String description;
	private String imageUrl;
	private double price;
	private String category;

}


package com.kspk.repository;

import com.kspk.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order,String> {

    List<Order> findByUserId(String userId);

    Optional<Order> findByStripePaymentIntentId(String paymentIntentId);
}

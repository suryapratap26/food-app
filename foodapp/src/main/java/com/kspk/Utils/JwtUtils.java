package com.kspk.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

@Service
public class JwtUtils {
    @Value("${SECRETKEY}")
    private String secretKey;


    public String genrateToken(UserDetails userDetails){
        Map<String, Objects> claims=new HashMap<>();
        return createToken(claims,userDetails.getUsername());
    }

    private String createToken(Map<String, Objects> claims, String subject) {

        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // or Decoders.HEX.decode()
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
      return    Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60*24))
                .signWith(key)
                .compact();

    }

    public String extractUsername(String token){
        return extractClaim(token, Claims ::getSubject);
    }
    public Date extractExpiration(String token){
        return extractClaim(token, Claims ::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims,T> claimResolver){
        final Claims claims= extractAllClaims(token);
        return claimResolver.apply(claims);
    }
    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());

    }

    public Boolean validateToken(String token,UserDetails userDetails){
        final String username =userDetails.getUsername();

        return (username.equals(extractUsername(token) ) && !isTokenExpired(token));
    }

}

# Stage 1: Builder (only needed if you were building inside the container,
# but we'll adapt to just copy the final JAR for simplicity and speed)

# Stage 2: Runtime Image (Minimal JRE for execution)
FROM eclipse-temurin:17-jre-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR file from the local 'target' directory
# Make sure the JAR name matches exactly, including the SNAPSHOT version
COPY target/foodapp-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot application runs on (default is 8080)
EXPOSE 8080

# Define the command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
# Stage 1: build
# Sử dụng Maven với JDK 17 (Amazon Corretto)
FROM maven:3.9.8-amazoncorretto-17 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

# Stage 2: create image
# Sử dụng Amazon Corretto JDK 17
FROM amazoncorretto:17

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]

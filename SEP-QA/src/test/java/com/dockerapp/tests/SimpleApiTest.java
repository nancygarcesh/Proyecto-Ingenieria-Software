package com.dockerapp.tests;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class SimpleApiTest {

    // URL base del servidor donde está tu aplicación corriendo
    private String baseUrl = "http://localhost:5000";  // Cambia a la URL correcta si es necesario

    @BeforeEach
    public void setup() {
        // Configura RestAssured con la URL base
        RestAssured.baseURI = baseUrl;
    }

    @Test
    public void testPageLoad() {
        // Realizamos una solicitud GET para comprobar que la página carga
        given()
                .when()
                .get("/")  // "/" es la ruta principal, cámbiala si es necesario
                .then()
                .statusCode(200);  // Comprobamos que la página se carga con éxito (código 200)
    }
}

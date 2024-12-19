package com.dockerapp.tests;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

import static org.junit.jupiter.api.Assertions.*;

public class SeleniumTest {

    private WebDriver driver;

    @BeforeEach
    public void setup() {
        // Usamos WebDriverManager para gestionar el driver de Chrome
        WebDriverManager.chromedriver().setup();

        // Inicializamos el navegador Chrome
        driver = new ChromeDriver();
    }

    @Test
    public void testAddProduct() {
        // 1. Cargar la página
        driver.get("http://localhost:5000"); // Reemplaza con la URL correcta de tu aplicación

        // 2. Iniciar sesión con usuario y contraseña
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.xpath("//*[@id=\"loginForm\"]/button"));

        // Rellenar los campos con las credenciales
        usernameField.sendKeys("admin");
        passwordField.sendKeys("123");

        // Hacer clic en el botón de inicio de sesión
        loginButton.click();

        // Esperar a que la página cargue después del inicio de sesión
        try {
            Thread.sleep(2000); // Esperar 2 segundos, se puede mejorar con WebDriverWait si se requiere más robustez
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 3. Hacer clic en el botón "Agregar Producto"
        WebElement addProductButton = driver.findElement(By.id("addProductButton"));
        addProductButton.click();

        // Esperar a que se cargue el formulario de agregar producto
        try {
            Thread.sleep(2000); // Esperar 2 segundos para asegurarse de que la página cargue
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 4. Rellenar los campos del formulario de producto
        WebElement nameField = driver.findElement(By.id("name"));
        WebElement descriptionField = driver.findElement(By.id("description"));
        WebElement quantityField = driver.findElement(By.id("quantity"));
        WebElement priceField = driver.findElement(By.id("price"));
        WebElement categoryField = driver.findElement(By.id("category"));
        WebElement imageField = driver.findElement(By.id("image"));

        // Completar los campos con datos ficticios
        nameField.sendKeys("Producto de Test");
        descriptionField.sendKeys("Descripción del producto de test.");
        quantityField.sendKeys("100");
        priceField.sendKeys("49");
        categoryField.sendKeys("Electrónica");
        imageField.sendKeys("path_to_image.jpg");  // Asegúrate de usar una ruta válida para la imagen

        // 5. Hacer clic en el botón de "Guardar"
        WebElement saveButton = driver.findElement(By.xpath("//*[@id=\"productForm\"]/button[1]"));
        saveButton.click();

        // Esperar a que la acción se complete
        try {
            Thread.sleep(2000); // Espera para verificar que la operación se realizó correctamente
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }

    @AfterEach
    public void tearDown() {
        // Cierra el navegador después de cada prueba
        if (driver != null) {
            driver.quit();
        }
    }
}

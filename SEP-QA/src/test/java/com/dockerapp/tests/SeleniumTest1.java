package com.dockerapp.tests;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

import static org.junit.jupiter.api.Assertions.*;

public class SeleniumTest1 {

    private WebDriver driver;

    @BeforeEach
    public void setup() {
        // Usamos WebDriverManager para gestionar el driver de Chrome
        WebDriverManager.chromedriver().setup();

        // Inicializamos el navegador Chrome
        driver = new ChromeDriver();
    }

    @Test
    public void testEditProduct() {
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

        // 3. Hacer clic en el botón "Editar Producto"
        WebElement editProductButton = driver.findElement(By.id("editProductButton"));
        editProductButton.click();

        // Esperar a que se cargue el formulario de editar producto
        try {
            Thread.sleep(2000); // Esperar 2 segundos para asegurarse de que la página cargue
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 4. Rellenar el campo de código del producto (el código debe ser 106)
        WebElement productCodeField = driver.findElement(By.id("editProductCode"));
        productCodeField.sendKeys("106");

        // 5. Hacer clic en el botón de búsqueda o cargar los datos del producto
        WebElement loadProductButton = driver.findElement(By.xpath("//*[@id=\"editProductForm\"]/button[1]"));
        loadProductButton.click();

        // Esperar a que se carguen los datos del producto
        try {
            Thread.sleep(2000); // Esperar 2 segundos
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 6. Rellenar los campos del formulario con los datos del producto (para el código 106)
        WebElement nameField = driver.findElement(By.id("editName"));
        WebElement descriptionField = driver.findElement(By.id("editDescription"));
        WebElement quantityField = driver.findElement(By.id("editQuantity"));
        WebElement priceField = driver.findElement(By.id("editPrice"));
        WebElement categoryField = driver.findElement(By.id("editCategory"));
        WebElement imageField = driver.findElement(By.id("editImage"));

        // Cargar los datos del producto 106
        nameField.clear();
        nameField.sendKeys("Mascarilla Chocolate");
        descriptionField.clear();
        descriptionField.sendKeys("Esta es un prueba para mostrar que se pueden agregar productos");
        quantityField.clear();
        quantityField.sendKeys("5");
        priceField.clear();
        priceField.sendKeys("8");
        categoryField.clear();
        categoryField.sendKeys("Skincare");
        imageField.clear();
        imageField.sendKeys("https://d1ekutaqv55e28.cloudfront.net/products/high-quality/750x750/chokola-mascara-de-chocolate.png");

        // 7. Hacer clic en el botón de "Guardar"
        WebElement saveButton = driver.findElement(By.xpath("//*[@id=\"editProductForm\"]/button[2]"));
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

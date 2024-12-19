# Usa una imagen base de Python
FROM python:3.9

# Define el directorio de trabajo
WORKDIR /app


# Copia los archivos de la app
COPY . /app

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto que usará Flask
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["python", "admin.py"]

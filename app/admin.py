from flask import Flask, request, Response, jsonify, render_template, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from MySQLdb import DatabaseError
from flask import send_from_directory
from flask_bcrypt import Bcrypt
import hashlib
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

import os

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = os.getenv('DB_HOST', 'db')  # Host de la base de datos
app.config['MYSQL_USER'] = os.getenv('DB_USER', 'sep_user')  # Usuario
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD', 'sep_password')  # Contraseña
app.config['MYSQL_DB'] = os.getenv('DB_NAME', 'sep_productos')  # Nombre de la base de datos
app.config['MYSQL_PORT'] = int(os.getenv('DB_PORT', 3306))  # Puerto

mysql = MySQL(app)
bcrypt = Bcrypt(app)

# Llave secreta para sesiones (importante para proteger las cookies de sesión)
app.secret_key = '5dd5f3d3b8c8e07e4f08398dd3a3e2c7'  # Una clave aleatoria fuerte


@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/')
def index():
    return render_template('inicio.html')

# Función auxiliar para obtener el conteo total de productos
def get_product_count():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM productos")
    return cursor.fetchone()[0]

# Validación de campos requeridos
def validate_fields(data, required_fields):
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, missing_fields
    return True, []



@app.route('/productos/reporte', methods=['GET'])
def generate_pdf_report():
    try:
        # Parámetros de filtro
        codigo = request.args.get('codigo') or None
        producto = request.args.get('producto') or None
        categoria = request.args.get('categoria') or None
        stock_min = request.args.get('stockMin', type=int) or 0
        stock_max = request.args.get('stockMax', type=int) or 999999

        # Validaciones
        if stock_min < 0 or stock_max < 0:
            return jsonify({'error': 'Los valores de stock no pueden ser negativos'}), 400
        if stock_min > stock_max:
            return jsonify({'error': 'El stock mínimo no puede ser mayor que el stock máximo'}), 400

        # Consulta SQL
        query = """
            SELECT codigo_producto, nombre_producto, descripcion, stock_total, precio_unitario, categoria
            FROM v_stock_productos
            WHERE (%s IS NULL OR codigo_producto LIKE CONCAT('%%', %s, '%%')) 
            AND (%s IS NULL OR nombre_producto LIKE CONCAT('%%', %s, '%%'))
            AND (%s IS NULL OR categoria LIKE CONCAT('%%', %s, '%%'))
            AND stock_total BETWEEN %s AND %s
        """
        cursor = mysql.connection.cursor()
        cursor.execute(query, (codigo, codigo, producto, producto, categoria, categoria, stock_min, stock_max))
        products = cursor.fetchall()

        # Generar PDF
        pdf_buffer = BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        width, height = letter
        c.setFont("Times-Bold", 20)
        c.drawString(200, height - 40, "Reporte de Productos Filtrados")
        c.setFont("Times-Roman", 10)

        headers = ["Código", "Producto", "Descripción", "Stock", "Precio", "Categoría"]
        x_start, y_start, line_height = 40, height - 80, 20
        column_widths = [50, 130, 160, 80, 80, 100]

        # Dibujar encabezados
        def draw_headers():
            c.setFont("Times-Bold", 12)
            for i, header in enumerate(headers):
                c.drawString(x_start + sum(column_widths[:i]), y_start, header)
            c.setFont("Times-Roman", 10)  # Cambiar fuente después de los encabezados

        draw_headers()
        y_start -= line_height

        for product in products:
            codigo, producto, descripcion, stock, precio, categoria = product

            # Dividir descripción en líneas de longitud fija
            max_line_length = 25  # Número máximo de caracteres por línea
            lineas_descripcion = [
                descripcion[i:i + max_line_length]
                for i in range(0, len(descripcion), max_line_length)
            ]

            # Dibujar valores
            valores = [codigo, producto, lineas_descripcion, stock, f"${precio:.2f}", categoria]
            for i, value in enumerate(valores):
                if i == 2:  # Si es la columna "Descripción"
                    for j, linea in enumerate(value):  # Dibujar cada línea de la descripción
                        c.drawString(
                            x_start + sum(column_widths[:i]),
                            y_start - (j * 10),  # Desplazar cada línea un poco hacia abajo
                            linea
                        )
                else:
                    c.drawString(
                        x_start + sum(column_widths[:i]),
                        y_start,
                        str(value)
                    )
            y_start -= line_height + (10 * (len(lineas_descripcion) - 1))

            # Salto de página si es necesario
            if y_start < 50:
                c.showPage()
                y_start = height - 80
                draw_headers()  # Redibujar encabezados
                y_start -= line_height

        c.save()
        pdf_buffer.seek(0)
        return Response(pdf_buffer, mimetype='application/pdf', headers={'Content-Disposition': 'inline; filename="reporte_productos_filtrados.pdf"'})

    except Exception as e:
        return jsonify({'error': 'Error al generar el PDF', 'details': str(e)}), 500




@app.route('/productos/<int:codigo>', methods=['GET'])
def get_product(codigo):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            SELECT codigo_producto, nombre_producto, descripcion, precio_unitario, categoria, imagen, stock_total
            FROM v_stock_productos
            WHERE codigo_producto = %s
            """,
            (codigo,)
        )
        product = cursor.fetchone()
        if not product:
            return jsonify({'message': 'Producto no encontrado'}), 404

        return jsonify({
            'codigo': product[0],
            'nombre': product[1],
            'descripcion': product[2],
            'precio_unitario': float(product[3]),
            'categoria': product[4],
            'imagen': product[5],
            'stock': product[6]
        })
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500


@app.route('/productos', methods=['GET'])
def get_products():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 8))
        offset = (page - 1) * limit

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM v_stock_productos")
        total_products = cursor.fetchone()[0]

        total_pages = -(-total_products // limit)
        if page > total_pages or page < 1:
            return jsonify({
                'error': 'Página no válida',
                'total_pages': total_pages,
                'current_page': page
            }), 400

        cursor.execute(
            """
            SELECT codigo_producto, nombre_producto, descripcion, precio_unitario, categoria, imagen, stock_total
            FROM v_stock_productos
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        products = cursor.fetchall()

        return jsonify({
            'products': [
                {
                    'codigo': row[0],
                    'nombre': row[1],
                    'descripcion': row[2],
                    'precio_unitario': float(row[3]),
                    'categoria': row[4],
                    'imagen': row[5],
                    'stock': row[6]
                } for row in products
            ],
            'total_pages': total_pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500


@app.route('/productos/<int:codigo>/lotes', methods=['GET'])
def get_product_lotes(codigo):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            SELECT l.id_lote, l.lote, l.fecha_vencimiento, l.stock
            FROM lotes l
            WHERE l.codigo_producto = %s
            ORDER BY l.fecha_vencimiento
            """,
            (codigo,)
        )
        lotes = cursor.fetchall()
        if not lotes:
            return jsonify({'message': 'No se encontraron lotes para este producto'}), 404

        return jsonify({
            'lotes': [
                {
                    'id_lote': row[0],
                    'lote': row[1],
                    'fecha_vencimiento': row[2].strftime('%Y-%m-%d'),
                    'stock': row[3]
                } for row in lotes
            ]
        })
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500



@app.route('/productos', methods=['POST'])
def add_product():
    try:
        data = request.json
        required_fields = ['nombre', 'descripcion', 'categoria', 'precio_unitario', 'imagen']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': 'Faltan campos requeridos', 'missing_fields': missing_fields}), 400

        cursor = mysql.connection.cursor()

        cursor.execute(
            "INSERT INTO productos (nombre, descripcion, categoria, precio_unitario, imagen) VALUES (%s, %s, %s, %s, %s)",
            (data['nombre'], data['descripcion'], data['categoria'], data['precio_unitario'], data['imagen'])
        )
        mysql.connection.commit()

        return jsonify({'message': 'Producto agregado', 'codigo': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500




@app.route('/productos/<int:codigo>', methods=['PUT'])
def update_product(codigo):
    try:
        data = request.json
        allowed_fields = ['nombre', 'descripcion', 'categoria', 'precio_unitario', 'imagen']
        updates = {field: data[field] for field in allowed_fields if field in data}

        if not updates:
            return jsonify({'error': 'No hay campos válidos para actualizar'}), 400

        set_clause = ", ".join([f"{field} = %s" for field in updates.keys()])
        values = list(updates.values()) + [codigo]

        cursor = mysql.connection.cursor()
        cursor.execute(f"UPDATE productos SET {set_clause} WHERE codigo = %s", values)
        mysql.connection.commit()

        return jsonify({'message': 'Producto actualizado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500



@app.route('/productos/<int:codigo>', methods=['DELETE'])
def delete_product(codigo):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM productos WHERE codigo = %s", (codigo,))
        mysql.connection.commit()
        return jsonify({'message': 'Producto eliminado'})
    except DatabaseError as db_err:
        return jsonify({'error': 'Error en la base de datos', 'details': str(db_err)}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500
    

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Faltan datos'}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id, password FROM usuarios WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user:
            user_id, hashed_password = user
            if hashed_password == hashlib.md5(password.encode()).hexdigest():
                session['user_id'] = user_id
                return jsonify({'message': 'Inicio de sesión exitoso'}), 200
            else:
                return jsonify({'error': 'Credenciales incorrectas'}), 401
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        print(f"Error en /login: {e}")  # Registra el error en la consola
        return jsonify({'error': 'Error interno'}), 500
    


@app.route('/lotes/<int:id_lote>', methods=['GET'])
def get_lote(id_lote):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            SELECT id_lote, codigo_producto, lote, fecha_vencimiento, stock
            FROM lotes
            WHERE id_lote = %s
            """,
            (id_lote,)
        )
        lote = cursor.fetchone()
        if not lote:
            return jsonify({'message': 'Lote no encontrado'}), 404

        return jsonify({
            'id_lote': lote[0],
            'codigo_producto': lote[1],
            'lote': lote[2],
            'fecha_vencimiento': lote[3].strftime('%Y-%m-%d'),
            'stock': lote[4]
        })
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500


@app.route('/lotes', methods=['POST'])
def add_lote():
    try:
        data = request.json
        required_fields = ['codigo_producto', 'lote', 'fecha_vencimiento', 'stock']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({'error': 'Faltan campos requeridos', 'missing_fields': missing_fields}), 400

        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            INSERT INTO lotes (codigo_producto, lote, fecha_vencimiento, stock)
            VALUES (%s, %s, %s, %s)
            """,
            (data['codigo_producto'], data['lote'], data['fecha_vencimiento'], data['stock'])
        )
        mysql.connection.commit()

        return jsonify({'message': 'Lote agregado', 'id_lote': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500



@app.route('/lotes/<int:id_lote>', methods=['PUT'])
def update_lote(id_lote):
    try:
        data = request.json
        allowed_fields = ['lote', 'fecha_vencimiento', 'stock']
        updates = {field: data[field] for field in allowed_fields if field in data and data[field] is not None}

        if not updates:
            return jsonify({'error': 'No hay campos válidos para actualizar'}), 400

        set_clause = ", ".join([f"{field} = %s" for field in updates.keys()])
        values = list(updates.values()) + [id_lote]

        cursor = mysql.connection.cursor()
        cursor.execute(f"UPDATE lotes SET {set_clause} WHERE id_lote = %s", values)
        mysql.connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'No se encontró el lote con el ID proporcionado'}), 404

        cursor.close()

        return jsonify({'message': 'Lote actualizado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500



@app.route('/lotes/<int:id_lote>', methods=['DELETE'])
def delete_lote(id_lote):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM lotes WHERE id_lote = %s", (id_lote,))
        mysql.connection.commit()
        return jsonify({'message': 'Lote eliminado'}), 200
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500


@app.route('/lotes', methods=['GET'])
def get_lotes():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM lotes")
        total_lotes = cursor.fetchone()[0]

        total_pages = -(-total_lotes // limit)
        if page > total_pages or page < 1:
            return jsonify({
                'error': 'Página no válida',
                'total_pages': total_pages,
                'current_page': page
            }), 400

        cursor.execute(
            """
            SELECT id_lote, codigo_producto, lote, fecha_vencimiento, stock
            FROM lotes
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        lotes = cursor.fetchall()

        return jsonify({
            'lotes': [
                {
                    'id_lote': row[0],
                    'codigo_producto': row[1],
                    'lote': row[2],
                    'fecha_vencimiento': row[3].strftime('%Y-%m-%d'),
                    'stock': row[4]
                } for row in lotes
            ],
            'total_pages': total_pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': 'Error interno', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

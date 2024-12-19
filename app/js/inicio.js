const productList = document.getElementById('productList');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const closeModalButton = document.getElementById('closeModalButton');
const editProductButton = document.getElementById('editProductButton');
const deleteProductButton = document.getElementById('deleteProductButton');
let currentPage = 1;
let editingProductCode = null; // Variable para almacenar el código del producto que estamos editando


document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const mainMenu = document.getElementById('mainMenu');
    const appContent = document.getElementById('appContent');
    const token = localStorage.getItem('token');

    if (token) {
        loginModal.style.display = 'none';
        mainMenu.style.display = 'block';
    } else {
        loginModal.style.display = 'block';
        mainMenu.style.display = 'none';
    }

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                localStorage.setItem('token', 'active');
                loginModal.style.display = 'none';
                mainMenu.style.display = 'block';
            } else {
                throw new Error('Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
        }
    });
});


function resetProductModals() {
    // Resetear el formulario de agregar producto
    document.getElementById('productForm').reset();
    
    // Resetear el formulario de editar producto
    document.getElementById('editProductForm').reset();
    document.getElementById('editProductCode').readOnly = false; // Habilitar la edición del código
    
    // Resetear el formulario de eliminar producto
    document.getElementById('deleteProductForm').reset();
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    
    // Mostrar solo la pestaña de agregar (si es necesario)
    document.getElementById('addTab').style.display = 'block';
}


// Función para mostrar la gestión de productos
function showProductManagement() {
    stopMenuBackground(); // Detener el fondo dinámico
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    loadProducts(); // Cargar productos
}


function generateReport() {
    stopMenuBackground(); // Detener el fondo dinámico
    const pdfContainer = document.getElementById('pdfContainer');
    const pdfViewer = document.getElementById('pdfViewer');

    pdfContainer.style.display = 'block';
    pdfViewer.src = 'http://localhost:5000/productos/reporte';
    document.getElementById('mainMenu').style.display = 'none';
}

// Mostrar el modal de filtros
function showFilterModal() {
    document.getElementById('filterModal').style.display = 'block';
}

// Cerrar el modal de filtros
function closeFilterModal() {
    document.getElementById('filterModal').style.display = 'none';
}

// Aplicar los filtros y actualizar el PDF
function applyFilters() {
    const formData = new FormData(document.getElementById('filterForm'));
    const query = new URLSearchParams(formData).toString();
    const pdfViewer = document.getElementById('pdfViewer');

    // Actualizar la URL del iframe con los filtros
    pdfViewer.src = `http://localhost:5000/productos/reporte?${query}`;

    // Cerrar el modal después de aplicar los filtros
    closeFilterModal();
}


function logout() {
    localStorage.removeItem('token');
    location.reload();
}

function returnToMenu() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('pdfContainer').style.display = 'none';
    startMenuBackground(); // Reiniciar el fondo dinámico
}

function openProductModal() {
    editingProductCode = null;  // Restablecer la variable para agregar un nuevo producto
    productModal.style.display = 'block';
}

function openLotModal() {
    document.getElementById('lotModal').style.display = 'block';
}

function closeLotModal() {
    document.getElementById('lotModal').style.display = 'none';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function openLotTab(tabId) {
    const tabs = ['addLotTab', 'editLotTab', 'deleteLotTab'];
    tabs.forEach(tab => {
        document.getElementById(tab).style.display = tab === tabId ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        startMenuBackground();
    }
});


function openEditProductModal() {
    document.getElementById('productModal').style.display = 'flex';  // Mostrar el modal
    openTab('edit');  // Abrir la pestaña de "Editar Producto"
}

function openDeleteProductModal() {
    document.getElementById('productModal').style.display = 'flex';  // Mostrar el modal
    openTab('delete');  // Abrir la pestaña de "Eliminar Producto"
}

function openTab(tab) {
    var tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(function (tabContent) {
        tabContent.style.display = 'none';
    });
    document.getElementById(tab + 'Tab').style.display = 'block';
}


function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}


document.getElementById('logoutButton').addEventListener('click', () => {
    // Borra el token del almacenamiento local
    localStorage.removeItem('token');

    // Recarga la página para volver al login
    location.reload();
});




async function loadProducts(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/productos?page=${page}&limit=8`);
        if (!response.ok) throw new Error('Error al obtener los productos');
        const data = await response.json();

        productList.innerHTML = '';

        for (const product of data.products) {
            const row = document.createElement('tr');

            // Obtener lotes asociados al producto
            const lotesResponse = await fetch(`http://localhost:5000/productos/${product.codigo}/lotes`);
            let lotes = [];
            if (lotesResponse.ok) {
                const lotesData = await lotesResponse.json();
                lotes = lotesData.lotes;
            }

            // Calcular si hay lotes próximos a vencer
            const today = new Date();
            let hasExpiringLot = false;
            for (const lote of lotes) {
                const expirationDate = new Date(lote.fecha_vencimiento);
                const daysToExpire = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
                if (daysToExpire <= 30) {
                    hasExpiringLot = true;
                    break;
                }
            }

            // Renderizar fila del producto
            row.innerHTML = `
                <td>${product.codigo}</td>
                <td>${product.nombre}</td>
                <td>${product.descripcion}</td>
                <td>
                    ${product.stock < 25 ? '<span class="alert-icon">⚠️</span>' : ''}
                    ${product.stock}
                </td>
                <td>${product.precio_unitario} Bs.</td>
                <td>${product.categoria}</td>
                <td><img src="${product.imagen}" width="50"></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img 
                            src="/static/images/edit_icon.png" 
                            alt="Editar" 
                            title="Editar" 
                            class="edit-image"
                            onclick="editProduct(${product.codigo})"
                        >

                        <div class="details-container">
                            <img 
                                src="/static/images/info_icon.png"  
                                alt="Detalles" 
                                onclick="showProductLots(${product.codigo})" 
                                class="details-image"
                            >
                            ${hasExpiringLot ? '<span class="alert-icon">⚠️</span>' : ''}
                        </div>
                    </div>

                </td>
            `;

            productList.appendChild(row);
        }

        updatePagination(data.total_pages, page);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}





// Mostrar formulario para agregar lote
function showAddLoteForm(productCode) {
    const modalContent = document.getElementById('lotModalContent');
    modalContent.innerHTML = `
        <h2>Agregar Lote</h2>
        <form onsubmit="addLote(event, ${productCode})">
            <label for="loteName">Nombre del Lote:</label>
            <input type="text" id="loteName" required>
            <label for="expiryDate">Fecha de Vencimiento:</label>
            <input type="date" id="expiryDate" required>
            <label for="loteStock">Cantidad:</label>
            <input type="number" id="loteStock" required>
            <button type="submit">Guardar</button>
            <button type="button" onclick="closeLotModal()">Cancelar</button>
        </form>
    `;
}

// Función para agregar un lote
async function addLote(event, productCode) {
    event.preventDefault();

    const lotData = {
        codigo_producto: productCode,
        lote: document.getElementById('loteName').value,
        fecha_vencimiento: document.getElementById('expiryDate').value,
        stock: document.getElementById('loteStock').value,
    };

    try {
        const response = await fetch('http://localhost:5000/lotes', {
            method: 'POST',
            body: JSON.stringify(lotData),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Error al agregar el lote');
        closeLotModal();
        showProductLots(productCode);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Cerrar modal de lotes
function closeLotModal() {
    document.getElementById('lotModal').style.display = 'none';
}





// Actualizar paginación
function updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener('click', () => loadProducts(i));
        pagination.appendChild(button);
    }
}

// Abrir el modal de edición
function openEditProductModal() {
    document.getElementById('editProductModal').style.display = 'block';
}

// Cerrar el modal de edición
function closeEditProductModal() {
    document.getElementById('editProductModal').style.display = 'none';
    document.getElementById('editProductForm').reset(); // Resetear el formulario
    document.getElementById('editProductCode').readOnly = false; // Habilitar la edición del código
    editingProductCode = null; // Limpiar la variable de código
}

// Función para cargar los detalles del producto cuando se ingresa el código
async function loadProductForEditing() {
    const codigo = document.getElementById('editProductCode').value;
    
    if (codigo) {
        try {
            const response = await fetch(`http://localhost:5000/productos/${codigo}`);
            if (!response.ok) throw new Error('Producto no encontrado');
            
            const product = await response.json();
            // Rellenar el formulario con los datos del producto
            document.getElementById('editName').value = product.nombre;
            document.getElementById('editDescription').value = product.descripcion;
           // document.getElementById('editQuantity').value = product.stock;
            document.getElementById('editPrice').value = product.precio_unitario;
            document.getElementById('editCategory').value = product.categoria;
            document.getElementById('editImage').value = product.imagen;

            // Bloquea el campo de código después de cargar los datos
            document.getElementById('editProductCode').readOnly = true;

            editingProductCode = codigo; // Asegurarse de que se guarde el código
        } catch (error) {
            console.error('Error al cargar el producto:', error);
            alert(error.message);
        }
    } else {
        alert('Por favor, introduce un código.');
    }
}



document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productData = {
        nombre: document.getElementById('editName').value,
        descripcion: document.getElementById('editDescription').value,
        //stock: parseInt(document.getElementById('editQuantity').value),
        precio_unitario: parseFloat(document.getElementById('editPrice').value),
        categoria: document.getElementById('editCategory').value,
        imagen: document.getElementById('editImage').value
    };

    if (!editingProductCode) {
        alert('No se ha seleccionado un producto para editar.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/productos/${editingProductCode}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            loadProducts(currentPage);
            closeModal();
            resetProductModals(); // Limpiar los campos de los modales
        } else {
            throw new Error('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
    }
});


// Función para eliminar el producto
async function deleteProductByCode(codigo) {
    try {
        const response = await fetch(`http://localhost:5000/productos/${codigo}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el producto');
        loadProducts(currentPage); // Recargar la lista de productos
        closeModal(); // Cerrar el modal
        resetProductModals(); // Limpiar los campos de los modales
    } catch (error) {
        alert(error.message);
    }
}


let menuBackgroundInterval = null;
const menuBackground = document.createElement('div');
menuBackground.classList.add('menu-background');
document.body.appendChild(menuBackground);

// Ruta de las imágenes
const images1 = [
    '/static/images/imagenmenu1.avif',
    '/static/images/imagenmenu2.avif',
    '/static/images/imagenmenu3.avif',
    '/static/images/imagenmenu4.avif',
    '/static/images/imagenmenu5.avif',
    '/static/images/imagenmenu7.avif',
    '/static/images/imagenmenu8.avif',
    '/static/images/imagenmenu9.avif',
    '/static/images/imagenmenu10.avif'
];
let currentImageIndex = 0;

// Función para iniciar el fondo dinámico
function startMenuBackground() {
    menuBackground.style.display = 'block'; // Mostrar el fondo dinámico
    currentImageIndex = 0; // Reiniciar el índice

    // Mostrar inmediatamente la primera imagen
    menuBackground.style.backgroundImage = `url(${images1[currentImageIndex]})`;

    // Cambiar las imágenes cada 2 segundos
    menuBackgroundInterval = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % images1.length; // Ciclo infinito
        menuBackground.style.backgroundImage = `url(${images1[currentImageIndex]})`;
    }, 3000);
}

// Función para detener el fondo dinámico
function stopMenuBackground() {
    clearInterval(menuBackgroundInterval); // Detener el cambio de imágenes
    menuBackground.style.backgroundImage = ''; // Restablecer fondo
    menuBackground.style.display = 'none'; // Ocultar el fondo dinámico
    document.body.style.backgroundColor = '#f1f1f1'; // Fondo blanco mármol
}

// Enviar formulario para eliminar producto
document.getElementById('deleteProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const codigo = document.getElementById('deleteProductCode').value;
    if (codigo) {
        deleteProductByCode(codigo);  // Llamar la función para eliminar el producto
    }
});


// Enviar formulario para agregar/editar producto
productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productData = {
        nombre: document.getElementById('name').value,
        descripcion: document.getElementById('description').value,
        //stock: document.getElementById('quantity').value,
        precio_unitario: document.getElementById('price').value,
        categoria: document.getElementById('category').value,
        imagen: document.getElementById('image').value
    };

    try {
        let response;
        if (editingProductCode) {
            // Actualizar producto
            response = await fetch(`http://localhost:5000/productos/${editingProductCode}`, {
                method: 'PUT',
                body: JSON.stringify(productData),
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Agregar producto
            response = await fetch('http://localhost:5000/productos', {
                method: 'POST',
                body: JSON.stringify(productData),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!response.ok) throw new Error('Error al guardar el producto');
        loadProducts(currentPage); // Recargar la lista de productos
        closeModal(); // Cerrar el modal
        resetProductModals(); // Limpiar los campos de los modales
    } catch (error) {
        console.error('Error:', error);
    }
});



// Inicializar la carga de productos al cargar la página
loadProducts();

function editProduct(productCode) {
    // Mostrar solo el modal de edición
    productModal.style.display = 'block';

    // Asegurarse de que solo el formulario de edición esté visible
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById('editTab').style.display = 'block';

    // Cargar automáticamente los datos del producto seleccionado
    fetch(`http://localhost:5000/productos/${productCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el producto');
            }
            return response.json();
        })
        .then(product => {
            document.getElementById('editProductCode').value = product.codigo;
            document.getElementById('editName').value = product.nombre;
            document.getElementById('editDescription').value = product.descripcion;
            document.getElementById('editQuantity').value = product.stock;
            document.getElementById('editPrice').value = product.precio_unitario;
            document.getElementById('editCategory').value = product.categoria;
            document.getElementById('editImage').value = product.imagen;
        })
        .catch(error => {
            alert(error.message);
        });
}

document.getElementById('detailProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const codigo = document.getElementById('detailProductCode').value;

    if (!codigo) {
        alert('Por favor, introduce un código.');
        return;
    }

    try {
        // Obtener datos del producto
        const productResponse = await fetch(`http://localhost:5000/productos/${codigo}`);
        if (!productResponse.ok) throw new Error('Producto no encontrado');

        const product = await productResponse.json();

        // Obtener lotes del producto
        const lotesResponse = await fetch(`http://localhost:5000/productos/${codigo}/lotes`);
        if (!lotesResponse.ok) throw new Error('No se encontraron lotes para este producto');

        const lotesData = await lotesResponse.json();

        // Renderizar información del producto y lotes
        const detailContainer = document.getElementById('detailProductInfo');
        detailContainer.innerHTML = `
            <h2>Producto: ${product.nombre}</h2>
            <p><strong>Descripción:</strong> ${product.descripcion}</p>
            <p><strong>Categoría:</strong> ${product.categoria}</p>
            <p><strong>Precio Unitario:</strong> ${product.precio_unitario}</p>
            <p><strong>Stock Total:</strong> ${product.stock}</p>
            <h3>Lotes:</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID Lote</th>
                        <th>Lote</th>
                        <th>Fecha de Vencimiento</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    ${lotesData.lotes
                        .map(
                            lote => `
                            <tr>
                                <td>${lote.id_lote}</td>
                                <td>${lote.lote}</td>
                                <td>${lote.fecha_vencimiento}</td>
                                <td>${lote.stock}</td>
                            </tr>
                        `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        alert(error.message);
    }
});


// Función para eliminar un producto específico
function deleteProduct(productCode) {
    const confirmation = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmation) {
        fetch(`http://localhost:5000/productos/${productCode}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo eliminar el producto');
            }
            alert('Producto eliminado exitosamente');
            loadProducts(currentPage); // Recargar la lista de productos
        })
        .catch(error => {
            alert(error.message);
        });
    }
}

// Enviar formulario para eliminar producto
document.getElementById('deleteLotForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const codigo = document.getElementById('deleteLotId').value;
    if (codigo) {
        deleteLotByCode(codigo);  // Llamar la función para eliminar el producto
    }
});

// Función para eliminar el producto
async function deleteLotByCode(codigo) {
    try {
        const response = await fetch(`http://localhost:5000/lotes/${codigo}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el lote');
        closeModal(); // Cerrar el modal
        resetProductModals(); // Limpiar los campos de los modales
    } catch (error) {
        alert(error.message);
    }
}

async function loadLotes(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/lotes?page=${page}&limit=8`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los lotes');
        }
        const data = await response.json();

        const lotList = document.getElementById('lotList'); // Contenedor de la tabla de lotes
        lotList.innerHTML = '';
        data.lotes.forEach(lote => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lote.id_lote}</td>
                <td>${lote.codigo_producto}</td>
                <td>${lote.lote}</td>
                <td>${lote.fecha_vencimiento}</td>
                <td>${lote.stock}</td>
                <td>
                    <img 
                        src="/static/images/edit_icon.png" 
                        alt="Editar" 
                        title="Editar" 
                        style="cursor: pointer; width: 27px; margin-right: 10px;"
                        onclick="editLote(${lote.id_lote})"
                    >
                    <img 
                        src="/static/images/borrar_icon.png" 
                        alt="Borrar" 
                        title="Borrar" 
                        style="cursor: pointer; width: 24px;"
                        onclick="deleteLote(${lote.id_lote})"
                    >
                </td>
            `;

            // Calcular días restantes para la fecha de vencimiento
            const today = new Date();
            const expirationDate = new Date(lote.fecha_vencimiento);
            const daysToExpire = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

            // Aplicar estilos según las condiciones
            if (lote.stock <= 10 && daysToExpire <= 30) {
                row.style.backgroundColor = '#ff9999'; // Rojo más fuerte para ambos
            } else if (lote.stock <= 10) {
                row.style.backgroundColor = '#ffcccc'; // Rojo bajito
            } else if (daysToExpire <= 30) {
                row.style.backgroundColor = '#e6ccff'; // Morado bajito
            }

            lotList.appendChild(row);
        });

        updateLotPagination(data.total_pages, page);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}


// Actualizar paginación de lotes
function updateLotPagination(totalPages, currentPage) {
    const pagination = document.getElementById('lotPagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener('click', () => loadLotes(i));
        pagination.appendChild(button);
    }
}

document.getElementById('addLotForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productCodeInput = document.getElementById('productCode');
    const lotNameInput = document.getElementById('lotName');
    const expiryDateInput = document.getElementById('expiryDate');
    const stockInput = document.getElementById('stock');

    if (!productCodeInput || !lotNameInput || !expiryDateInput || !stockInput) {
        console.error('No se encontraron los elementos del formulario. Verifica los IDs en el HTML.');
        return;
    }

    const lotData = {
        codigo_producto: productCodeInput.value,
        lote: lotNameInput.value,
        fecha_vencimiento: expiryDateInput.value,
        stock: stockInput.value,
    };

    try {
        const response = await fetch('http://localhost:5000/lotes', {
            method: 'POST',
            body: JSON.stringify(lotData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Error al agregar el lote');
        //loadLotes(); // Recargar la lista de lotes
        closeLotModal(); // Cerrar el modal
        document.getElementById('addLotForm').reset(); // Limpiar el formulario
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});




// Función para abrir el modal y cargar datos del lote
async function editLote(loteId) {
    try {
        const response = await fetch(`http://localhost:5000/lotes/${loteId}`);
        if (!response.ok) throw new Error('Lote no encontrado.');

        const lote = await response.json();

        // Rellenar el formulario con los datos del lote
        document.getElementById('editLotId').value = lote.id_lote;
        document.getElementById('editLotName').value = lote.lote;
        document.getElementById('editExpiryDate').value = lote.fecha_vencimiento;
        document.getElementById('editStock').value = lote.stock;

        // Mostrar el formulario de edición
        document.getElementById('editLotFormContainer').style.display = 'block';
        document.getElementById('lotModalContent').style.display = 'none'; // Ocultar contenido principal
    } catch (error) {
        console.error('Error al cargar el lote para editar:', error);
        alert(error.message);
    }
}

// Evento para manejar la actualización del lote
document.getElementById('editLotForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar recarga de página

    const loteId = document.getElementById('editLotId').value;
    const lotData = {
        lote: document.getElementById('editLotName').value,
        fecha_vencimiento: document.getElementById('editExpiryDate').value,
        stock: parseInt(document.getElementById('editStock').value, 10),
    };

    try {
        const response = await fetch(`http://localhost:5000/lotes/${loteId}`, {
            method: 'PUT',
            body: JSON.stringify(lotData),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar el lote.');
        }

        alert('Lote actualizado exitosamente.');

        // Cerrar el formulario de edición
        document.getElementById('editLotFormContainer').style.display = 'none';
        document.getElementById('lotModalContent').style.display = 'block'; // Mostrar contenido principal del modal

        // Recargar la lista de lotes después de la actualización
        const productCode = document.getElementById('editLotId').value; // O bien el código del producto
        showProductLots(productCode); // Cambié la llamada para que cargue los lotes del producto correctamente
    } catch (error) {
        console.error('Error al actualizar el lote:', error);
        alert('Ocurrió un error al actualizar el lote.');
    }
});

// Mostrar el modal con los lotes del producto seleccionado
async function showProductLots(productCode) {
    try {
        const response = await fetch(`http://localhost:5000/productos/${productCode}/lotes`);
        if (!response.ok) throw new Error('Error al obtener los lotes');

        const data = await response.json();
        const lotes = data.lotes;

        const modalContent = document.getElementById('lotModalContent');
        modalContent.innerHTML = `
            <h2>Lotes del Producto ${productCode}</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID Lote</th>
                        <th>Lote</th>
                        <th>Fecha de Vencimiento</th>
                        <th>Stock</th>

                    </tr>
                </thead>
                <tbody>
                    ${lotes
                        .map(lote => `
                            <tr style="${new Date(lote.fecha_vencimiento) - new Date() < 30 * 24 * 60 * 60 * 1000 ? 'background-color: #ffdddd;' : ''}">
                                <td>${lote.id_lote}</td>
                                <td>${lote.lote}</td>
                                <td>${lote.fecha_vencimiento}</td>
                                <td>${lote.stock}</td>
   
                            </tr>
                        `).join('')}
                </tbody>
            </table>
            <button onclick="showAddLoteForm(${productCode})">Agregar Lote</button>
        `;

        document.getElementById('lotModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}




async function deleteLote(loteId) {
    const confirmation = confirm('¿Estás seguro de que deseas eliminar este lote?');
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:5000/lotes/${loteId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Error al eliminar el lote');
        //loadLotes(); // Recargar la lista de lotes
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Cargar los detalles del lote para editar
async function loadLotForEditing() {
    const loteId = document.getElementById('editLotId').value;

    if (loteId) {
        try {
            const response = await fetch(`http://localhost:5000/lotes/${loteId}`);
            if (!response.ok) throw new Error('Lote no encontrado');

            const lote = await response.json();

            // Rellenar el formulario con los datos del lote
            document.getElementById('editLotName').value = lote.lote;
            document.getElementById('editExpiryDate').value = lote.fecha_vencimiento;
            document.getElementById('editStock').value = lote.stock;

            // Bloquea el campo de ID del lote después de cargar los datos
            document.getElementById('editLotId').readOnly = true;

            editingLotId = loteId; // Asegurarse de que se guarde el ID del lote
        } catch (error) {
            console.error('Error al cargar el lote:', error);
            alert(error.message);
        }
    } else {
        alert('Por favor, introduce un ID de lote.');
    }
}

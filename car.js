// Clase para manejar el carrito de compras
class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.updateCartDisplay();
    }

    // Agregar un artículo al carrito
    attachEventListeners() {
        // Evento para agregar al carrito
        document.querySelectorAll('.add-to-cart, .cta_tarjeta-rest a').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const item = {
                    id: button.getAttribute('data-id'),
                    name: button.getAttribute('data-name'),
                    price: parseFloat(button.getAttribute('data-price'))
                };
                this.addItem(item);
            });
        });

        // Evento para eliminar del carrito (delegación de eventos)
        document.getElementById('cart-items').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const id = e.target.getAttribute('data-id');
                this.removeItem(id);
            }
        });
    }

    addItem(item) {
        // Verifica si el artículo ya está en el carrito
        const existingItem = this.items.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }

        this.calculateTotal();
        this.saveToLocalStorage();
        this.updateCartDisplay();
    }

    // Eliminar un artículo del carrito
    removeItem(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            if (this.items[index].quantity > 1) {
                this.items[index].quantity -= 1;
            } else {
                this.items.splice(index, 1);
            }

            this.calculateTotal();
            this.saveToLocalStorage();
            this.updateCartDisplay();
        }
    }

    // Calcular el total del carrito
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Guardar el carrito en localStorage
    saveToLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
        localStorage.setItem('cartTotal', this.total);
    }

    // Cargar el carrito desde localStorage
    loadFromLocalStorage() {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartTotal');
        this.items = [];
        this.total = 0;
    }

    // Actualizar la visualización del carrito
    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        cartItemsContainer.innerHTML = '';

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.innerHTML = `${item.name} - $${item.price} x ${item.quantity} 
            <button class="remove-item" data-id="${item.id}">Eliminar</button>`;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = `Total: $${this.total.toFixed(2)}`;
    }

    // Generar ticket de compra
    generarTicket() {
        if (this.items.length === 0) {
            alert("Error: No se ha agregado ningún producto al carrito.");
            return; // Detener la generación del ticket
        }

        // Calcular subtotal
        const subtotal = this.total;
        const iva = subtotal * 0.16; // Calcular IVA (16%)
        const totalConIva = subtotal + iva;

        // Generar contenido del ticket
        let ticket = "Restaurante Think & Eat\n";
        ticket += "--- TICKET DE COMPRA ---\n";
        ticket += "------------------------\n";

        this.items.forEach(item => {
            ticket += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        ticket += `------------------------\n`;
        ticket += `Subtotal: $${subtotal.toFixed(2)}\n`;
        ticket += `IVA (16%): $${iva.toFixed(2)}\n`;
        ticket += `TOTAL: $${totalConIva.toFixed(2)}\n`;
        ticket += "¡Gracias!";

        // Mostrar el ticket en un alert
        alert(ticket);

        // Crear el PDF con jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Agregar el contenido del ticket al PDF
        doc.text(ticket, 10, 10);

        // Descargar el PDF con el nombre "ticket.pdf"
        doc.save("ticket.pdf");
    }
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const cart = new Cart();

    // Añadir evento para generar el ticket
    const generarTicketBtn = document.getElementById('generar-ticket');
    if (generarTicketBtn) {
        generarTicketBtn.addEventListener('click', () => {
            cart.generarTicket();
        });
    }
});

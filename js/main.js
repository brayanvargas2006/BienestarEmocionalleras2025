// ======== COMUNIDAD CORREGIDO ========

const formComentario = document.getElementById("form-comentario");
const contenedorComentarios = document.getElementById("comentarios");
const btnAdmin = document.getElementById("btn-admin");

let comentarios = JSON.parse(localStorage.getItem("comentarios")) || [];

const ADMIN_PASSWORD = "admin123";
let esAdmin = false;

// Generar ID único
function generarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function guardarComentarios() {
    localStorage.setItem("comentarios", JSON.stringify(comentarios));
}

// Función recursiva para renderizar comentarios y respuestas
function agregarComentarioDOM(comentario, container) {
    const div = document.createElement("div");
    div.classList.add("comentario");
    div.dataset.id = comentario.id;
    div.style.marginBottom = "10px";

    const nombre = document.createElement("p");
    nombre.innerHTML = `<b>👤 Usuario:</b> ${comentario.nombre}`;

    const mensaje = document.createElement("p");
    mensaje.innerHTML = `<b>💬 Comentario:</b> ${comentario.mensaje}`;

    div.appendChild(nombre);
    div.appendChild(mensaje);

    // Botón responder
    const btnResponder = document.createElement("button");
    btnResponder.textContent = "Responder";
    btnResponder.classList.add("btn-responder");
    div.appendChild(btnResponder);

    // Contenedor para respuestas
    if (!comentario.respuestas) comentario.respuestas = [];
    const respuestasContainer = document.createElement("div");
    respuestasContainer.classList.add("comentario-respuestas");
    respuestasContainer.style.marginLeft = "20px";
    div.appendChild(respuestasContainer);

    // Botón mostrar/ocultar respuestas
    if (comentario.respuestas.length > 0) {
        const btnToggle = document.createElement("button");
        btnToggle.textContent = "⇅ Mostrar/Ocultar respuestas";
        btnToggle.style.marginBottom = "5px";
        btnToggle.addEventListener("click", () => {
            if (respuestasContainer.style.display === "none") {
                respuestasContainer.style.display = "block";
            } else {
                respuestasContainer.style.display = "none";
            }
        });
        div.insertBefore(btnToggle, respuestasContainer);
    }

    // Botón eliminar admin
    if (esAdmin) {
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => {
            eliminarComentarioPorId(comentario.id, comentarios);
            guardarComentarios();
            mostrarComentarios();
        });
        div.appendChild(btnEliminar);
    }

    container.appendChild(div);

    // Renderizar respuestas recursivamente
    comentario.respuestas.forEach(r => agregarComentarioDOM(r, respuestasContainer));
}

// Eliminar comentario por ID
function eliminarComentarioPorId(id, array) {
    const index = array.findIndex(c => c.id === id);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    }
    for (let c of array) {
        if (c.respuestas && eliminarComentarioPorId(id, c.respuestas)) return true;
    }
    return false;
}

// Encontrar comentario por ID
function encontrarComentarioPorId(id, array) {
    for (let c of array) {
        if (c.id === id) return c;
        if (c.respuestas) {
            const r = encontrarComentarioPorId(id, c.respuestas);
            if (r) return r;
        }
    }
    return null;
}

// Listener global para responder
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-responder")) {
        const comentarioDiv = e.target.closest(".comentario");

        if (comentarioDiv.querySelector(".form-respuesta")) return;

        const formRespuesta = document.createElement("form");
        formRespuesta.classList.add("form-respuesta");
        formRespuesta.innerHTML = `
            <input type="text" class="nombre-respuesta" placeholder="Tu nombre" required>
            <textarea class="mensaje-respuesta" placeholder="Escribe tu respuesta..." required></textarea>
            <button type="submit">Enviar</button>
        `;
        comentarioDiv.appendChild(formRespuesta);

        formRespuesta.addEventListener("submit", function (ev) {
            ev.preventDefault();
            const nombre = formRespuesta.querySelector(".nombre-respuesta").value.trim();
            const mensaje = formRespuesta.querySelector(".mensaje-respuesta").value.trim();
            if (!nombre || !mensaje) return;

            const idPadre = comentarioDiv.dataset.id;
            const comentarioPadre = encontrarComentarioPorId(idPadre, comentarios);
            if (comentarioPadre) {
                comentarioPadre.respuestas.push({
                    id: generarId(),
                    nombre,
                    mensaje,
                    respuestas: []
                });
            }

            guardarComentarios();
            mostrarComentarios();
        });
    }
});

// Mostrar comentarios
function mostrarComentarios() {
    contenedorComentarios.innerHTML = "";
    if (comentarios.length === 0) {
        const aviso = document.createElement("p");
        aviso.textContent = "No hay comentarios todavía. ¡Sé el primero en comentar!";
        aviso.style.fontStyle = "italic";
        aviso.style.color = "#666";
        contenedorComentarios.appendChild(aviso);
        return;
    }
    comentarios.forEach(c => agregarComentarioDOM(c, contenedorComentarios));
}

// Enviar comentario principal
formComentario.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    if (!nombre || !mensaje) return;

    comentarios.push({
        id: generarId(),
        nombre,
        mensaje,
        respuestas: []
    });
    guardarComentarios();
    mostrarComentarios();
    formComentario.reset();
});

// Activar admin
function activarAdmin() {
    const entrada = prompt("Ingresa la contraseña de administrador:");
    if (entrada === ADMIN_PASSWORD) {
        esAdmin = true;
        alert("Modo administrador activado");
        mostrarComentarios();
    } else alert("Contraseña incorrecta");
}

document.addEventListener("keydown", (e) => {
    if (e.key === "1") btnAdmin.style.display = "block";
});
btnAdmin.addEventListener("click", activarAdmin);

document.addEventListener("DOMContentLoaded", mostrarComentarios);
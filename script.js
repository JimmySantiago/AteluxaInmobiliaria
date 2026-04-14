/* =============================================
   ATELUXA S.A.S. — script.js
   Formulario de contacto · Formspree
   Versión: 1.0.0 · Producción
============================================= */

/* -----------------------------------------------
   CONFIGURACIÓN — reemplaza con tu endpoint real
   1. Crea cuenta en https://formspree.io
   2. Crea un formulario y copia tu endpoint
   3. Pega el endpoint en FORMSPREE_ENDPOINT
----------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/meevorzb";


/* -----------------------------------------------
   INICIALIZACIÓN
   Espera a que el DOM esté completamente cargado
----------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initForm();
});


/* -----------------------------------------------
   FORMULARIO DE CONTACTO
----------------------------------------------- */
function initForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", handleSubmit);

  // Limpiar errores al escribir en cada campo
  form.querySelectorAll("input, textarea").forEach(field => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("blur",  () => clearFieldError(field));
  });
}


async function handleSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;

  // Recoger valores
  const fields = {
    nombre:   form.querySelector("#nombre"),
    email:    form.querySelector("#email"),
    telefono: form.querySelector("#telefono"),
    servicio: form.querySelector("#servicio"),
    mensaje:  form.querySelector("#mensaje"),
  };

  // Validar campos obligatorios
  const isValid = validateFields(fields);
  if (!isValid) return;

  // Estado de envío
  const btn = form.querySelector(".btn-submit");
  setButtonLoading(btn, true);

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        nombre:   fields.nombre.value.trim(),
        email:    fields.email.value.trim(),
        telefono: fields.telefono.value.trim(),
        servicio: fields.servicio.value.trim(),
        mensaje:  fields.mensaje.value.trim(),
      })
    });

    if (res.ok) {
      showToast("¡Mensaje enviado! Te contactaremos pronto.", "success");
      form.reset();
      form.querySelectorAll(".form-group").forEach(g => g.classList.remove("has-error"));
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = (data.errors && data.errors[0]?.message) || "Error al enviar. Intenta nuevamente.";
      showToast(msg, "error");
    }

  } catch {
    showToast("Error de conexión. Verifica tu internet.", "error");
  } finally {
    setButtonLoading(btn, false);
  }
}


/* -----------------------------------------------
   VALIDACIÓN DE CAMPOS
----------------------------------------------- */
function validateFields({ nombre, email, mensaje }) {
  let valid = true;

  if (!nombre.value.trim()) {
    setFieldError(nombre, "El nombre es obligatorio.");
    valid = false;
  }

  if (!email.value.trim()) {
    setFieldError(email, "El correo es obligatorio.");
    valid = false;
  } else if (!isValidEmail(email.value.trim())) {
    setFieldError(email, "Ingresa un correo válido.");
    valid = false;
  }

  if (!mensaje.value.trim()) {
    setFieldError(mensaje, "El mensaje es obligatorio.");
    valid = false;
  }

  return valid;
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function setFieldError(field, msg) {
  const group = field.closest(".form-group");
  if (!group) return;

  group.classList.add("has-error");

  // Crear o actualizar mensaje de error
  let errEl = group.querySelector(".field-error");
  if (!errEl) {
    errEl = document.createElement("span");
    errEl.className = "field-error";
    group.appendChild(errEl);
  }
  errEl.textContent = msg;

  // Animar el campo con un ligero shake
  field.classList.remove("shake");
  void field.offsetWidth; // reflow
  field.classList.add("shake");
}

function clearFieldError(field) {
  const group = field.closest(".form-group");
  if (!group) return;
  group.classList.remove("has-error");
  const errEl = group.querySelector(".field-error");
  if (errEl) errEl.remove();
  field.classList.remove("shake");
}


/* -----------------------------------------------
   ESTADO DEL BOTÓN
----------------------------------------------- */
function setButtonLoading(btn, loading) {
  if (!btn) return;

  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = `<span class="btn-spinner"></span>Enviando…`;
    btn.disabled = true;
    btn.style.opacity = "0.8";
    btn.style.cursor  = "not-allowed";
  } else {
    btn.innerHTML = btn.dataset.originalText || "Enviar mensaje";
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.cursor  = "";
  }
}


/* -----------------------------------------------
   TOAST — Notificación flotante elegante
----------------------------------------------- */
function showToast(text, type = "success") {
  // Eliminar toast anterior si existe
  const prev = document.getElementById("ateluxa-toast");
  if (prev) {
    prev.classList.remove("toast-visible");
    setTimeout(() => prev?.remove(), 350);
  }

  const toast = document.createElement("div");
  toast.id = "ateluxa-toast";
  toast.className = `ateluxa-toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  // Ícono SVG acorde al tipo
  const icon = type === "success"
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${text}</span>
    <div class="toast-progress"></div>
  `;

  document.body.appendChild(toast);

  // Forzar reflow antes de activar la transición
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("toast-visible");
    });
  });

  // Auto-cerrar después de 4.5s
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast?.remove(), 400);
  }, 4500);
}
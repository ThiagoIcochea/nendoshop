import Swal from "sweetalert2";

const methodOptions = [
  {
    value: "email",
    label: "Correo",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
  },
  {
    value: "sms",
    label: "SMS",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M12 18h.01"></path></svg>`
  },
  {
    value: "call",
    label: "Llamada",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.63 2.59a2 2 0 0 1-.45 2.11L7.6 8.6a16 16 0 0 0 6.8 6.8l1.18-1.18a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.59.63A2 2 0 0 1 22 16.92z"></path></svg>`
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.56 8.56 0 0 1-1.5 4.7A8.5 8.5 0 0 1 12.5 21a8.56 8.56 0 0 1-4.7-1.5L3 21l2.5-4.8A8.56 8.56 0 0 1 4 11.5a8.5 8.5 0 0 1 4.8-7.5A8.5 8.5 0 0 1 21 11.5z"></path></svg>`
  }
];

export const promptMfaMethodSelection = async ({
  title = "Verificación requerida",
  description = "Elige cómo recibir el código para confirmar esta acción.",
  confirmButtonText = "Continuar",
  cancelButtonText = "Volver"
} = {}) => {
  const result = await Swal.fire({
    title,
    html: `
      <div class="text-left">
        <p class="mb-3 text-sm text-gray-600">${description}</p>
        <div class="grid grid-cols-2 gap-3">
          ${methodOptions
            .map(
              (option) => `
                <button type="button" data-method="${option.value}" class="mfa-method-btn flex items-center gap-2 rounded-2xl border border-purple-200 bg-white p-2 text-sm font-medium text-gray-700 transition hover:border-purple-500 hover:bg-purple-50">
                  <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">${option.icon}</span>
                  ${option.label}
                </button>`
            )
            .join("")}
        </div>
        <input id="mfa-method-picker" type="hidden" value="email" />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl border border-purple-100 shadow-2xl",
      confirmButton: "rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-white border-0 shadow-md",
      cancelButton: "rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700"
    },
    preConfirm: () => document.getElementById("mfa-method-picker")?.value || "email",
    didOpen: () => {
      const buttons = document.querySelectorAll(".mfa-method-btn");
      const hidden = document.getElementById("mfa-method-picker");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const selected = button.getAttribute("data-method");
          if (hidden) hidden.value = selected;
          buttons.forEach((item) => item.classList.remove("border-purple-500", "bg-purple-50", "ring-2", "ring-purple-500"));
          button.classList.add("border-purple-500", "bg-purple-50", "ring-2", "ring-purple-500");
        });
      });
    }
  });

  return {
    ...result,
    value: result?.value || null
  };
};

export const promptVerificationCode = async ({
  title = "Verificación",
  description = "Ingresa el código recibido.",
  placeholder = "Código de verificación",
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar"
} = {}) => {
  const result = await Swal.fire({
    title,
    html: `
      <div class="text-left">
        <p class="mb-3 text-sm text-gray-600">${description}</p>
        <div id="verification-code-grid" class="flex justify-center gap-2"></div>
        <input id="verification-code-hidden" type="hidden" />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl border border-purple-100 shadow-2xl",
      confirmButton: "rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-white border-0 shadow-md",
      cancelButton: "rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700"
    },
    preConfirm: () => document.getElementById("verification-code-hidden")?.value || "",
    didOpen: () => {
      const container = document.getElementById("verification-code-grid");
      const hidden = document.getElementById("verification-code-hidden");
      const inputs = [];

      const updateHidden = () => {
        if (hidden) hidden.value = inputs.map((input) => input.value).join("");
      };

      for (let index = 0; index < 6; index += 1) {
        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "numeric";
        input.maxLength = 1;
        input.placeholder = index === 0 ? "0" : "";
        input.className = "h-12 w-10 rounded-xl border border-gray-300 text-center text-lg font-semibold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200";
        input.addEventListener("input", (event) => {
          const value = event.target.value.replace(/\D/g, "");
          event.target.value = value;
          if (value && index < 5) inputs[index + 1]?.focus();
          updateHidden();
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && !input.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
            updateHidden();
          }
        });
        inputs.push(input);
        container?.appendChild(input);
      }

      inputs[0]?.focus();
      updateHidden();
    }
  });

  return {
    ...result,
    value: result?.value || null
  };
};

export const promptMfaCode = async ({
  title = "Confirmar verificación",
  description = "Ingresa el código que recibiste.",
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar"
} = {}) => promptVerificationCode({ title, description, confirmButtonText, cancelButtonText });

export const promptDeliveryCode = async ({
  title = "Confirmar entrega",
  description = "Ingresa el código de validación para marcar esta entrega como completada.",
  confirmButtonText = "Confirmar entrega",
  cancelButtonText = "Cancelar"
} = {}) => promptVerificationCode({ title, description, confirmButtonText, cancelButtonText });

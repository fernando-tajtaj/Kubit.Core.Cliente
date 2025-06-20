const correoInput = document.getElementById('UsuarioCorreo');
const btnConsultarEmpresas = document.getElementById('btnConsultarEmpresas');
const empresaSelect = document.getElementById('EmpresaSelect');
const empresaContainer = document.getElementById('empresaContainer');
const contraseniaContainer = document.getElementById('contraseniaContainer');
const contraseniaInput = document.getElementById('UsuarioContrasenia');
const btnLogin = document.getElementById('btnLogin');

correoInput.addEventListener('input', () => {
    btnConsultarEmpresas.disabled = correoInput.value.trim() === '';

    // Limpiar cuando cambie el correo
    empresaSelect.innerHTML = '<option value="">Seleccione una empresa</option>';
    empresaContainer.classList.add('d-none');
    contraseniaContainer.classList.add('d-none');
    btnLogin.disabled = true;
});

btnConsultarEmpresas.addEventListener('click', () => {
    const correo = correoInput.value.trim();
    if (!correo) return;

    btnConsultarEmpresas.disabled = true;

    fetch(`/Autenticacion/Login?handler=Empresas&pUsuarioCorreo=${encodeURIComponent(correo)}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) throw new Error('No se encontraron empresas para este correo.');
                else throw new Error('Error al consultar empresas.');
            }
            return response.json();
        })
        .then(empresas => {
            empresaSelect.innerHTML = '<option value="">Seleccione una empresa</option>';
            empresas.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.empresaUuid || emp.empresauuid;
                option.textContent = emp.empresaNombre || emp.empresanombre;
                empresaSelect.appendChild(option);
            });

            if (empresas.length > 0) {
                empresaContainer.classList.remove('d-none');
                contraseniaContainer.classList.remove('d-none');
                btnLogin.classList.remove('d-none');

                // Ocultar botón Consultar
                btnConsultarEmpresas.classList.add('d-none');
            } else {
                empresaContainer.classList.add('d-none');
                contraseniaContainer.classList.add('d-none');
                btnLogin.classList.add('d-none');

                // Mostrar botón Consultar en caso no haya empresas
                btnConsultarEmpresas.classList.remove('d-none');
            }

            btnLogin.disabled = true;
        })
        .catch(error => {
            alert(error.message);
            empresaContainer.classList.add('d-none');
            contraseniaContainer.classList.add('d-none');
            empresaSelect.innerHTML = '<option value="">Seleccione una empresa</option>';
            btnLogin.disabled = true;
        })
        .finally(() => {
            btnConsultarEmpresas.disabled = false;
        });
});

// Habilitar login sólo si hay empresa seleccionada y contraseña
function checkLoginAvailability() {
    btnLogin.disabled = !(empresaSelect.value && contraseniaInput.value.trim());
}

empresaSelect.addEventListener('change', checkLoginAvailability);
contraseniaInput.addEventListener('input', checkLoginAvailability);

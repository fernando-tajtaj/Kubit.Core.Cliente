define([], function () {
    function openSelectOption(fieldId, uuidParamBusqueda) {
        const hiddenInput = document.getElementById(fieldId);
        const button = document.getElementById('val_' + fieldId);
        const dropdownMenu = button?.nextElementSibling;

        if (!button || !hiddenInput || !dropdownMenu) return;

        fetch(`?handler=ConsultaDatos&pParamConsultaUuid=${encodeURIComponent(uuidParamBusqueda)}`)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener datos");
                return response.json();
            })
            .then(json => {
                // Limpiar menú actual
                dropdownMenu.innerHTML = '';

                json.datos.forEach(row => {
                    const uuid = row.uuid;

                    const columnasVisibles = json.columnas
                        .filter(c => !c.hidden && c.id !== 'uuid')
                        .map(c => row[c.id] ?? '')
                        .filter(val => val !== '');

                    const nombre = columnasVisibles.join(' - ').trim();

                    if (uuid && nombre) {
                        const li = document.createElement('li');

                        const btn = document.createElement('button');
                        btn.className = 'dropdown-item';
                        btn.type = 'button';
                        btn.textContent = nombre;
                        btn.onclick = function () {
                            hiddenInput.value = uuid;
                            button.querySelector('span').textContent = nombre;
                        };

                        li.appendChild(btn);
                        dropdownMenu.appendChild(li);
                    }
                });

                button.disabled = false;
            })
            .catch(error => {
                console.error("Error cargando el dropdown:", error);
                alert("No se pudieron cargar las opciones.");
            });
    }

    function selectDropdownOption(fieldId, value, label) {
        document.getElementById(`val_${fieldId}`).innerText = label;
        document.getElementById(`${fieldId}`).value = value;
    }

    // Exportar la función
    return {
        selectDropdownOption,
        openSelectOption,
    };
});
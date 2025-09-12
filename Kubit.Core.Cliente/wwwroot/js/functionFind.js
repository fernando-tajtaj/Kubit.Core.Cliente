define([], function () {
    // Función para escapar comillas simples en strings que se usan dentro de comillas simples JS
    function escapeForSingleQuotes(str) {
        if (!str) return '';
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function openFindModal(fieldId, uuidParamBusqueda, ctrlParent, subModelo, index) {
        const modalId = `modal_${fieldId}`;

        // Si ya existe, eliminarlo para regenerarlo con datos actualizados
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        let valParents;
        let paramParents = '';

        if (ctrlParent) {
            let valCtrlParent;

            if (!subModelo) {
                const elements = document.getElementsByName(`Valores.Campos[${ctrlParent}]`);
                if (elements.length > 0) {
                    valCtrlParent = elements[0];
                    valParents = valCtrlParent.value;
                }
            } else {
                valCtrlParent = document.getElementById(ctrlParent);
                if (valCtrlParent) {
                    valParents = valCtrlParent.value;
                }
            }

            if (valParents) {
                paramParents = `${ctrlParent}=${encodeURIComponent(valParents)}`;
            }
        }

        fetch(`?handler=ConsultaDatos&pParamConsultaUuid=${encodeURIComponent(uuidParamBusqueda)}&${paramParents}`)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener datos");
                return response.json();
            })
            .then(json => {
                const visibleColumns = json.columnas.filter(c => !c.hidden);
                const columnFilters = Object.fromEntries(json.columnas.map(c => [c.id, c.filtrar]));

                const headers = visibleColumns.map(col => `<th>${col.name}</th>`).join('');
                const filterInputs = visibleColumns.map(col => {
                    return columnFilters[col.id] === 1
                        ? `<th><input type="text" class="form-control form-control-sm" data-col="${col.id}" placeholder="Buscar..." /></th>`
                        : `<th></th>`;
                }).join('');

                const generateRows = (data) => {
                    if (data.length === 0) {
                        return `<tr><td colspan="${visibleColumns.length + 1}" class="text-center">Sin datos disponibles.</td></tr>`;
                    }

                    return data.map(row => {
                        const cells = visibleColumns.map(col => `<td>${row[col.id] ?? ''}</td>`).join('');
                        const nombreParaMostrarRaw = row.id ?? row[visibleColumns[0].id];
                        const nombreParaMostrar = escapeForSingleQuotes(nombreParaMostrarRaw);
                        const uuidEscaped = escapeForSingleQuotes(row.uuid);
                        const fieldIdEscaped = escapeForSingleQuotes(fieldId);

                        return `<tr>${cells}<td>
                        <button class="btn btn-sm btn-light" onclick="require(['functionFind'], function(find) { find.selectFindValue('${fieldIdEscaped}', '${uuidEscaped}', '${nombreParaMostrar}'); });">Seleccionar</button>
                    </td></tr>`;
                    }).join('');
                };

                const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}_label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}_label">Buscar</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table table-hover border-dark" id="tabla_${fieldId}">
                                <thead>
                                    <tr>${headers}<th></th></tr>
                                    <tr>${filterInputs}<th></th></tr>
                                </thead>
                                <tbody>
                                    ${generateRows(json.datos)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;

                document.body.insertAdjacentHTML('beforeend', modalHtml);
                const modal = new bootstrap.Modal(document.getElementById(modalId));
                modal.show();

                // Filtros dinámicos
                const table = document.getElementById(`tabla_${fieldId}`);
                const inputs = table.querySelectorAll('thead input[data-col]');
                const tbody = table.querySelector('tbody');

                inputs.forEach(input => {
                    input.addEventListener("input", () => {
                        const filtros = {};
                        inputs.forEach(i => {
                            const val = i.value.trim().toLowerCase();
                            if (val) filtros[i.dataset.col] = val;
                        });

                        const filtrados = json.datos.filter(row => {
                            return Object.entries(filtros).every(([col, val]) => {
                                return (row[col] ?? '').toString().toLowerCase().includes(val);
                            });
                        });

                        tbody.innerHTML = generateRows(filtrados);
                    });
                });
            })
            .catch(error => {
                console.error("Error al abrir modal de búsqueda:", error);
                alert("No se pudo cargar la búsqueda.");
            });
    }

    function selectFindValue(fieldId, idValue, nameValue) {
        document.getElementById(`${fieldId}`).value = idValue;
        document.getElementById(`val_${fieldId}`).value = nameValue;

        const modal = bootstrap.Modal.getInstance(document.getElementById(`modal_${fieldId}`));
        modal.hide();
    }

    function clearFindValue(fieldId) {
        document.getElementById(`${fieldId}`).value = '';
        document.getElementById(`val_${fieldId}`).value = '';
    }

    function openModalMessage(type, message) {
        // Si ya existe el modal, eliminarlo para evitar duplicados
        const existente = document.getElementById('mensajeModal');
        if (existente) {
            existente.remove();
        }

        // Crear el modal
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal fade';
        modalDiv.id = 'mensajeModal';
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute('aria-labelledby', 'mensajeModalLabel');
        modalDiv.setAttribute('aria-hidden', 'true');

        modalDiv.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title" id="mensajeModalLabel"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <div class="modal-body d-flex align-items-start">
                    <div id="modalIcon" class="me-3 fs-3"></div>
                    <div><p id="modalMensaje" class="mb-0"></p></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>

            </div>
        </div>`;

        document.body.appendChild(modalDiv);

        // Setear título, mensaje e ícono
        const titulo = modalDiv.querySelector('#mensajeModalLabel');
        const mensaje = modalDiv.querySelector('#modalMensaje');

        const tipoTitulo = {
            'error': 'Error',
            'advertencia': 'Advertencia',
            'exito': 'Éxito'
        };

        titulo.textContent = tipoTitulo[type] || 'Mensaje';
        mensaje.textContent = message;

        // Crear instancia y mostrar modal con Bootstrap
        const bsModal = new bootstrap.Modal(modalDiv);
        bsModal.show();

        // Opcional: eliminar modal del DOM cuando se oculta para limpieza
        modalDiv.addEventListener('hidden.bs.modal', () => {
            modalDiv.remove();
        });
    }


    return {
        openFindModal,
        openModalMessage,
        selectFindValue,
        clearFindValue
    };
});
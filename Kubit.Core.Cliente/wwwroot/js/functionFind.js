define([], function () {
    // Función para escapar comillas simples en strings que se usan dentro de comillas simples JS
    function escapeForSingleQuotes(str) {
        if (!str) return '';
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    // Render filas de la tabla
    function generateRows(id, columns, data, fieldMappings) {
        if (data.length === 0) {
            return `<tr><td colspan="${columns.length + 1}" class="text-center">
            <div class="text-muted">
                <i class="bi bi-inbox" style="font-size:2rem;"></i><br>
                Sin datos disponibles
            </div>
        </td></tr>`;
        }

        return data.map(row => {
            const cells = columns.map(col => {
                let value = row[col.id] ?? '';

                if (typeof value === 'string' && value.startsWith('tag|')) {
                    const items = value.substring(4).split(',').map(i => i.trim());
                    value = items.map(item =>
                        `<span class="badge text-bg-secondary me-1">${item}</span>`
                    ).join(' ');
                }

                return `<td>${value}</td>`;
            }).join('');

            const idValue = escapeForSingleQuotes(row.uuid);
            const nameValueShow = row.id ?? row[columns[0].id];
            const nameValue = escapeForSingleQuotes(nameValueShow);

            return `
            <tr>${cells}<td>
                <button aria-label="Buscar" class="btn btn-sm btn-light" 
                    onclick='require(["functionFind"], function(find) { 
                        find.selectFindValue(
                            "${id}", 
                            "${idValue}", 
                            "${nameValue}", 
                            ${JSON.stringify(row)},
                            ${fieldMappings ? JSON.stringify(fieldMappings) : "null"}
                        ); 
                    });'>
                    Seleccionar
                </button>
        </td></tr>`;
        }).join('');
    }

    // Render tabla completa
    function renderTable(id, json, fieldMappings) {
        const visibleColumns = json.columnas.filter(c => !c.hidden);
        const columnFilters = Object.fromEntries(json.columnas.map(c => [c.id, c.filtrar]));

        const headers = visibleColumns.map(col => `<th>${col.name}</th>`).join('');
        const filterInputs = visibleColumns.map(col =>
            columnFilters[col.id] === 1
                ? `<th><input type="text" class="form-control form-control-sm" data-col="${col.id}" placeholder="Buscar..." /></th>`
                : `<th></th>`
        ).join('');

        return `
        <table class="table table-hover border-dark" id="tabla_${id}">
            <thead>
                <tr>${headers}<th></th></tr>
                <tr>${filterInputs}<th></th></tr>
            </thead>
            <tbody>
                ${generateRows(id, visibleColumns, json.datos, fieldMappings)}
            </tbody>
        </table>`;
    }

    // Agregar eventos a filtros
    function attachFindFilters(id, table, columns, data) {
        const inputs = table.querySelectorAll('thead input[data-col]');
        const tbody = table.querySelector('tbody');

        inputs.forEach(input => {
            input.addEventListener("input", () => {
                const filtros = {};
                inputs.forEach(i => {
                    const val = i.value.trim().toLowerCase();
                    if (val) filtros[i.dataset.col] = val;
                });

                const filtrados = data.filter(row =>
                    Object.entries(filtros).every(([col, val]) =>
                        (row[col] ?? '').toString().toLowerCase().includes(val)
                    )
                );

                tbody.innerHTML = generateRows(id, columns, filtrados);
            });
        });
    }

    // Abrir modal
    function openFindModal(id, uuidParamBusqueda, ctrlParent, subModelo, fieldMappings) {
        const modalId = `modal_${id}`;
        document.getElementById(modalId)?.remove();

        let valParents = '';

        if (ctrlParent) {
            const ctrl = subModelo
                ? document.getElementById(ctrlParent)
                : document.getElementsByName(`Valores.Campos[${ctrlParent}]`)[0];
            if (ctrl) valParents = `${ctrlParent}=${encodeURIComponent(ctrl.value)}`;
        }

        fetch(`?handler=ConsultaDatos&pParamConsultaUuid=${encodeURIComponent(uuidParamBusqueda)}&${valParents}`)
            .then(r => r.json())
            .then(json => {
                const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Buscar</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${renderTable(id, json, fieldMappings)}
                            </div>
                        </div>
                    </div>
                </div>`;

                document.body.insertAdjacentHTML('beforeend', modalHtml);
                const modal = new bootstrap.Modal(document.getElementById(modalId));
                modal.show();

                // enganchar filtros
                const table = document.getElementById(`tabla_${id}`);
                const columns = json.columnas.filter(c => !c.hidden);
                const data = json.datos;

                attachFindFilters(id, table, columns, data);
            })
            .catch(err => console.error("Error al abrir modal de búsqueda:", err));
    }

    // Selección y limpieza
    function selectFindValue(id, idValue, nameValue, data, fieldMappings) {
        document.getElementById(`${id}`).value = idValue;
        document.getElementById(`val_${id}`).value = nameValue;

        if (fieldMappings) {
            let mappingsObj;

            if (typeof fieldMappings === "string") {
                try {
                    mappingsObj = JSON.parse(fieldMappings);
                } catch (e) {
                    console.error("fieldMappings no es JSON válido:", fieldMappings);
                    mappingsObj = null;
                }
            } else {
                mappingsObj = fieldMappings;
            }

            if (mappingsObj && data) {
                for (const [col, targetId] of Object.entries(mappingsObj)) {
                    if (data[col] !== undefined) {
                        const target = document.getElementById(targetId);
                        if (target) {
                            target.value = data[col];
                        }
                    }
                }
            }
        }

        bootstrap.Modal.getInstance(document.getElementById(`modal_${id}`))?.hide();
    }
    function clearFindValue(id) {
        document.getElementById(`${id}`).value = '';
        document.getElementById(`val_${id}`).value = '';
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
        mensaje.innerHTML = message;

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
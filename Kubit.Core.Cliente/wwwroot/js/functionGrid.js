define([], function () {
    const gridCollection = {};

    function requireAsync(deps) {
        return new Promise((resolve, reject) => {
            try {
                require(deps, (...mods) => resolve(mods));
            } catch (e) {
                reject(e);
            }
        });
    }

    function createView(div, columnas, datos) {
        const container = document.getElementById(div);

        if (!container) {
            console.error(`No se encontró el div con ID "${div}"`);
            return;
        }

        container.innerHTML = '';

        if (datos.length === 0) {
            const table = document.createElement('table');
            table.className = 'table mb-0 text-center';

            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');
            const th = document.createElement('th');
            th.colSpan = columnas.filter(c => !c.hidden).length || 1;
            th.textContent = "Datos";
            trHead.appendChild(th);
            thead.appendChild(trHead);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = columnas.filter(c => !c.hidden).length || 1;
            td.innerHTML = `
        <div class="text-muted">
            <i class="bi bi-inbox" style="font-size:2rem;"></i><br>
            No hay datos disponibles
        </div>`;
            tr.appendChild(td);
            tbody.appendChild(tr);

            table.appendChild(tbody);
            container.appendChild(table);
            return;
        }

        const table = document.createElement('table');
        table.className = 'table mb-0';

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        const trFilter = document.createElement('tr');

        columnas.forEach(col => {
            if (col.hidden) return;

            const th = document.createElement('th');
            th.textContent = col.name || col.id;
            trHead.appendChild(th);

            const thFilter = document.createElement('th');
            if (col.filtrar === true && col.tipofiltro === 1) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control form-control-sm';
                input.placeholder = 'Buscar...';
                input.dataset.colId = col.id;

                input.addEventListener('input', () => {
                    filtrarTabla(table);
                });

                thFilter.appendChild(input);
            }
            trFilter.appendChild(thFilter);
        });

        thead.appendChild(trHead);
        thead.appendChild(trFilter);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // Guardar datos
        table.dataset.originalData = JSON.stringify(datos);
        table.dataset.columnas = JSON.stringify(columnas);

        // Asignar función render al dataset
        table.renderRows = function (filtrados) {
            tbody.innerHTML = '';

            filtrados.forEach(row => {
                const tr = document.createElement('tr');

                columnas.forEach(col => {
                    if (col.hidden) return;
                    const td = document.createElement('td');
                    let valor = row[col.id];

                    // 1️⃣ Booleanos
                    if (typeof valor === 'boolean') {
                        td.textContent = valor ? "Activo" : "Inactivo";
                    }
                    // 2️⃣ Strings
                    else if (typeof valor === 'string') {
                        const valLower = valor.toLowerCase();

                        if (valLower === "true") {
                            td.textContent = "Activo";
                        }
                        else if (valLower === "false") {
                            td.textContent = "Inactivo";
                        }
                        else if (valor.startsWith('tag|')) {
                            const items = valor.substring(4).split(',').map(i => i.trim());
                            items.forEach((item, index) => {
                                const span = document.createElement('span');
                                span.className = 'badge text-bg-secondary';
                                span.textContent = item;
                                td.appendChild(span);
                                if (index < items.length - 1) td.appendChild(document.createElement('br'));
                            });
                        }
                        else if (valor.startsWith('foto|')) {
                            const rutas = valor.substring(5).split(',').map(r => r.trim());
                            const enlace = document.createElement('a');
                            enlace.href = '#';
                            enlace.textContent = 'Ver fotos';
                            enlace.className = 'badge text-bg-secondary';
                            enlace.addEventListener('click', e => {
                                e.preventDefault();
                                mostrarModalFotos(rutas);
                            });
                            td.appendChild(enlace);
                        }
                        else {
                            td.textContent = valor ?? '';
                        }
                    }
                    // 3️⃣ Números
                    else if (typeof valor === 'number') {
                        td.textContent = valor ?? '';
                    }
                    // 4️⃣ Otros tipos
                    else {
                        td.textContent = valor ?? '';
                    }

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });
        };

        table.renderRows(datos);
        container.appendChild(table);
    }

    function filtrarTabla(table) {
        const columnas = JSON.parse(table.dataset.columnas);
        const datosOriginales = JSON.parse(table.dataset.originalData);
        const inputs = table.querySelectorAll('thead input');
        const filtros = {};

        inputs.forEach(input => {
            const colId = input.dataset.colId;
            const valor = input.value.trim().toLowerCase();
            if (valor) filtros[colId] = valor;
        });

        const filtrados = datosOriginales.filter(row => {
            return Object.entries(filtros).every(([colId, valor]) => {
                const celda = (row[colId] ?? '').toString().toLowerCase();
                return celda.includes(valor);
            });
        });

        table.renderRows(filtrados);
    }

    function createGrid(tabla, modelo, columnas, datos, fieldComputed) {
        const container = document.getElementById(`div_${tabla}`);

        if (!container) {
            console.error(`No se encontró el div con ID "div_${tabla}"`);
            return;
        }

        gridCollection[tabla] = { modelo, columnas, datos };
        container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-striped table-bordered table-hover';

        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const visibleColumns = columnas.filter(c => !c.hidden);

        if (datos.length === 0) {
            // Mostrar "sin datos" como encabezado
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = visibleColumns.length + 1;
            td.className = 'text-center';

            td.innerHTML = `
                <div class="text-muted py-3">
                    <i class="bi bi-inbox" style="font-size:2rem;"></i><br>
                    Sin datos disponibles
                </div>
            `;

            tr.appendChild(td);
            thead.appendChild(tr); // lo mostramos en el thead
        } else {
            // Crear encabezados normales
            const trHead = document.createElement('tr');
            visibleColumns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col.name || col.id;
                trHead.appendChild(th);
            });
            // Columna para eliminar
            const thDelete = document.createElement('th');
            trHead.appendChild(thDelete);

            thead.appendChild(trHead);

            // Crear filas
            for (const row of datos) {
                const tr = document.createElement('tr');

                for (const col of visibleColumns) {
                    const td = document.createElement('td');
                    td.textContent = row[col.id] ?? '';
                    tr.appendChild(td);
                }

                // Columna eliminar
                const tdDelete = document.createElement('td');
                tdDelete.className = 'text-center';
                const btnDelete = document.createElement('button');
                btnDelete.type = 'button';
                btnDelete.className = 'btn btn-sm btn-warning';
                btnDelete.textContent = 'Eliminar';

                // asignar la función global, pasando los parámetros necesarios
                btnDelete.addEventListener('click', () => {
                    deleteGridRow(tabla, row, fieldComputed);
                });

                tdDelete.appendChild(btnDelete);

                tr.appendChild(tdDelete);
                tbody.appendChild(tr);
            }
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
    }

    async function addGridRow(tabla, fieldComputed) {
        const g = gridCollection[tabla];
        if (!g) return console.warn('Coleccion no encontrada:', tabla);

        const { modelo, datos } = g;

        // Procesar el modelo: valores base, archivos, validaciones
        const { valid, errores, valoresBase, valoresBaseJson, camposFile, campoExistente } = processModel(modelo, datos);

        if (!valid) {
            showErrors(errores);
            return;
        }

        // Procesar archivos si los hay
        if (camposFile.length > 0) {
            await processFiles(camposFile, tabla);
        }

        const requiereUUID = modelo.some(m => m.id === 'uuid' && m.valor === '');

        // Procesar filas: agregar nueva o merge si existe
        await processRows(tabla, valoresBase, valoresBaseJson, campoExistente, fieldComputed, requiereUUID);

        cleanModel(modelo);

        // Actualizar grilla y hidden input
        updateGrid(tabla, fieldComputed);
    }

    function processModel(modelo, datos) {
        let valid = true;
        const errores = [];
        const valoresBase = {};
        const valoresBaseJson = {};
        const camposFile = [];
        const campoExistente = {};

        for (const { id, name, valor, tablaprincipal, requerido, unico, modo } of modelo) {
            if (id === 'uuid' && valor === '') continue;

            if (valor === 'uuidforeignkey') {
                valoresBase[id] = 'uuidforeignkey';
                if (tablaprincipal) valoresBaseJson[id] = 'uuidforeignkey';
                continue;
            }

            const input = document.getElementById(valor);

            if (input && input.type === 'file') {
                camposFile.push({ id, name, inputId: input.id, requerido, unico, modo, tablaprincipal });
                continue;
            }

            const v = input ? (input.value || input.textContent || null) : null;

            if (requerido && (v === null || v === '')) {
                valid = false;
                errores.push(`Falta ${name}`);
            }

            if (unico && modo === 'alert' && datos.some(r => r[id] === v)) {
                valid = false;
                errores.push(`${name} duplicado`);
            }

            if (unico && modo === 'merge') {
                const registroExistente = datos.find(r => r[id] === v);
                if (registroExistente) campoExistente[id] = v;
            }

            valoresBase[id] = v;
            if (tablaprincipal) valoresBaseJson[id] = v;
        }

        return { valid, errores, valoresBase, valoresBaseJson, camposFile, campoExistente };
    }

    function showErrors(errores) {
        require(['functionFind'], f => f.openModalMessage('error', errores.join('<br>')));
    }

    async function processFiles(camposFile, tabla) {
        const [functionPhoto] = await requireAsync(['functionPhoto']);
        camposFile.forEach(cf => functionPhoto.addPhoto(cf.inputId, tabla));
    }

    async function processRows(tabla, valoresBase, valoresBaseJson, campoExistente, fieldComputed, requiereUUID) {
        const g = gridCollection[tabla];
        if (!g) return console.warn('Coleccion no encontrada:', tabla);

        const datos = g.datos;
        const [functionMask] = await requireAsync(['functionMask']);

        if (Object.keys(campoExistente).length === 0) {
            // --- Nueva fila ---
            const filaCompleta = { ...valoresBase };
            const filaJson = { ...valoresBaseJson };

            if (requiereUUID) {
                const uuid = crypto.randomUUID().replace(/-/g, '').toLowerCase();
                filaCompleta.uuid = uuid;
                filaJson.uuid = uuid;
            }

            // Calcular campos dinámicos
            const calculados = functionMask.computeValues(filaCompleta, fieldComputed);
            Object.assign(filaCompleta, calculados);

            // Agregar fila al array de datos
            datos.push(filaCompleta);

        } else {
            // --- Merge con fila existente ---
            for (const [clave, valor] of Object.entries(campoExistente)) {
                const registroExistente = datos.find(r => r[clave] === valor);
                if (!registroExistente) continue;

                Object.keys(valoresBase).forEach(campo => {
                    const nuevoValor = valoresBase[campo];
                    const valorExistente = registroExistente[campo];

                    const nuevoNum = parseFloat(nuevoValor);
                    const existenteNum = parseFloat(valorExistente);

                    if (!isNaN(nuevoNum) && !isNaN(existenteNum)) {
                        registroExistente[campo] = existenteNum + nuevoNum;
                    } else if (valorExistente === undefined || valorExistente === null || valorExistente === '') {
                        registroExistente[campo] = nuevoValor;
                    }
                });

                // Recalcular campos dinámicos en la fila existente
                const calculados = functionMask.computeValues(registroExistente, fieldComputed);
                Object.assign(registroExistente, calculados);
            }
        }
    }
    function updateGrid(tabla, fieldComputed) {
        const { modelo, columnas, datos } = gridCollection[tabla];

        createGrid(tabla, modelo, columnas, datos, fieldComputed);

        const hddSubValoresT = document.getElementById(`hddSubValoresT_${tabla}`);
        const hddSubValoresD = document.getElementById(`hddSubValoresD_${tabla}`);

        if (hddSubValoresT) hddSubValoresT.value = tabla;

        if (hddSubValoresD) {
            // Solo columnas principales para guardar en BD
            const datosFiltrados = datos.map(fila => {
                const filaFiltrada = {};
                modelo.forEach(m => {
                    if (m.tablaprincipal) filaFiltrada[m.id] = fila[m.id];
                });
                return filaFiltrada;
            });
            hddSubValoresD.value = JSON.stringify(datosFiltrados);
        }
    }

    // función para eliminar una fila y recalcular la grilla
    async function deleteGridRow(tabla, row, fieldComputed) {
        const g = gridCollection[tabla];
        if (!g) return console.warn('Coleccion no encontrada:', tabla);

        const { modelo, columnas, datos } = g; // obtenemos todo desde la colección
        const index = datos.indexOf(row);

        if (index > -1) {
            // eliminar la fila
            datos.splice(index, 1);

            // recalcular campos dinámicos para las filas restantes
            const [functionMask] = await requireAsync(['functionMask']);
            if (datos.length == 0) {

            }
            else {
                datos.forEach(fila => {
                    const calculados = functionMask.computeValues(fila, fieldComputed);
                    Object.assign(fila, calculados);
                });
            }

            // reconstruir la grilla
            createGrid(tabla, modelo, columnas, datos, fieldComputed);
        }
    }

    function cleanModel(modelo) {
        // Limpiar los controles utilizados
        modelo.forEach(({ valor }) => {
            if (!valor || valor === 'uuidforeignkey') return;

            const el = document.getElementById(valor);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = '';
                } else if (el.classList.contains('dropdown-toggle')) {
                    const label = el.querySelector('.dropdown-label');
                    if (label) label.textContent = 'Seleccione una opción';

                    // Opcional: limpia también el input hidden asociado
                    const hiddenInput = document.getElementById(valor.replace('val_', ''));
                    if (hiddenInput) hiddenInput.value = '';
                } else {
                    el.textContent = '';
                }
            }
        });
    }

    return {
        createView,
        createGrid,
        addGridRow
    };
});
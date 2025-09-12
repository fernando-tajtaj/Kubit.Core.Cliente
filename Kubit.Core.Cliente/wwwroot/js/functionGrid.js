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
            if (col.filtrar === 1 && col.tipofiltro === 1) {
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

    function createGrid(tabla, modelo, columnas, datos) {
        const container = document.getElementById(`div_${tabla}`);

        if (!container) {
            console.error(`No se encontró el div con ID "div_${tabla}"`);
            return;
        }

        // Registrar la tabla en la colección
        gridCollection[tabla] = {
            modelo,
            columnas,
            datos
        };

        container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-striped table-bordered table-hover';

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        // Filtrar columnas visibles una vez
        const visibleColumns = columnas.filter(c => !c.hidden);

        // Crear encabezados
        for (const col of visibleColumns) {
            const th = document.createElement('th');
            th.textContent = col.name || col.id;
            trHead.appendChild(th);
        }

        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        // Mostrar "Sin datos" si la lista está vacía
        if (datos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = visibleColumns.length;
            td.className = 'text-center text-muted row-sin-datos';
            td.textContent = 'Sin datos';
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            // Crear filas normales
            for (const row of datos) {
                const tr = document.createElement('tr');
                for (const col of visibleColumns) {
                    const td = document.createElement('td');
                    td.textContent = row[col.id] ?? '';
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
        }

        table.appendChild(tbody);
        container.appendChild(table);
    }

    async function addGridRow(tabla) {
        const g = gridCollection[tabla];
        if (!g) return console.warn('Coleccion no encontrada:', tabla);

        const { modelo, datos, columnas } = g;

        let valid = true;
        const errores = [];

        const valoresBase = {};      // Para fila completa
        const valoresBaseJson = {};  // Para JSON final (filtrado)
        const camposFile = [];

        for (const { id, name, valor, tablaprincipal, requerido, unico } of modelo) {
            if (id === 'uuid' && valor === '') continue;

            if (valor === 'uuidforeignkey') {
                valoresBase[id] = 'uuidforeignkey';
                if (tablaprincipal) valoresBaseJson[id] = 'uuidforeignkey';
                continue;
            }

            const input = document.getElementById(valor);

            if (input && input.type === 'file') {
                camposFile.push({ id, name, inputId: input.id, requerido, unico, tablaprincipal });
                continue;
            }

            const v = input ? (input.value || input.textContent || null) : null;

            if (requerido && (v === null || v === '')) {
                valid = false;
                errores.push(`Falta ${name}`);
            }

            if (unico && datos.some(r => r[id] === v)) {
                valid = false;
                errores.push(`${name} duplicado`);
            }

            valoresBase[id] = v;
            if (tablaprincipal) {
                valoresBaseJson[id] = v;
            }
        }

        if (!valid) {
            require(['functionFind'], f => f.openModalMessage('error', errores.join('\n')));
            return;
        }

        // 2) Procesar archivos
        if (camposFile.length > 0) {
            const [functionPhoto] = await requireAsync(['functionPhoto']);
            camposFile.forEach(cf => functionPhoto.addPhoto(cf.inputId, tabla));
        }

        const requiereUUID = modelo.some(m => m.id === 'uuid' && m.valor === '');

        // 3) Construir filas
        if (camposFile.length === 0) {
            const filaCompleta = { ...valoresBase };
            const filaJson = { ...valoresBaseJson };

            if (requiereUUID) {
                const uuid = crypto.randomUUID().replace(/-/g, '').toLowerCase();
                filaCompleta.uuid = uuid;
                filaJson.uuid = uuid;
            }

            datos.push(filaCompleta);
            g.datosJson = g.datosJson || [];
            g.datosJson.push(filaJson);

        } else {
            for (const { id, name, inputId, requerido, unico, tablaprincipal } of camposFile) {
                const inputFile = document.getElementById(inputId);
                const files = Array.from(inputFile?.files || []).filter(f => f.type.startsWith('image/'));

                if (requerido && files.length === 0) {
                    valid = false;
                    errores.push(`Falta ${name}`);
                    continue;
                }

                for (const f of files) {
                    const nuevoValor = f.name;
                    if (unico && datos.some(r => r[id] === nuevoValor)) {
                        valid = false;
                        errores.push(`${name} duplicado (${nuevoValor})`);
                        continue;
                    }

                    const filaCompleta = { ...valoresBase, [id]: nuevoValor };
                    const filaJson = { ...valoresBaseJson };
                    if (tablaprincipal) {
                        filaJson[id] = nuevoValor;
                    }

                    if (requiereUUID) {
                        const uuid = crypto.randomUUID().replace(/-/g, '').toLowerCase();
                        filaCompleta.uuid = uuid;
                        filaJson.uuid = uuid;
                    }

                    datos.push(filaCompleta);
                    g.datosJson = g.datosJson || [];
                    g.datosJson.push(filaJson);
                }
            }
        }

        if (!valid) {
            require(['functionFind'], f => f.openModalMessage('error', errores.join('\n')));
            return;
        }

        // 4) Limpiar modelo y refrescar tabla
        cleanModel(modelo);
        createGrid(tabla, modelo, columnas, datos);

        const hddSubValoresT = document.getElementById(`hddSubValoresT_${tabla}`);
        const hddSubValoresD = document.getElementById(`hddSubValoresD_${tabla}`);

        if (hddSubValoresT) {
            hddSubValoresT.value = tabla;
        }

        if (hddSubValoresD) {
            hddSubValoresD.value = JSON.stringify(g.datosJson || []);
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
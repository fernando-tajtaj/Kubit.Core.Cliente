define([], function () {
    const subModelList = {};

    function validateSubForm(tabla) {
        const form = document.getElementById("SubValores_" + tabla);
        if (!form) return false;

        const inputs = form.querySelectorAll("[name^='SubValores.Campos']");
        let isValid = true;

        inputs.forEach(input => {
            const required = input.required || input.getAttribute("required") === "true";
            const value = input.value?.trim();

            if (required && !value) {
                isValid = false;
                input.classList.add("is-invalid");

                const linked = form.querySelector(`[data-linked-hidden='${input.id}']`);
                if (linked) linked.classList.add("is-invalid");
            } else {
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
            }
        });

        form.classList.add("was-validated");
        return isValid;
    }

    function getSubFormData(form) {
        const data = {};
        const uniqueKeys = [];
        const inputs = form.querySelectorAll("[name^='SubValores.Campos']");

        inputs.forEach(input => {
            const match = input.name.match(/SubValores\.Campos\[(.+?)\]/);
            if (!match) return;

            const key = match[1];
            let value = "";

            if (input.type === "checkbox") {
                value = input.checked ? "true" : "false";
            } else if (input.type === "radio") {
                if (!input.checked) return;
                value = input.value;
            } else {
                value = input.value;
            }

            data[key] = value;

            // Marcar claves únicas
            if (input.dataset.unique === "true") {
                uniqueKeys.push({ key, value });
            }
        });

        return { data, uniqueKeys };
    }

    function renderSubFormDataList(container, dataList, type = "table") {
        container.innerHTML = "";

        dataList.forEach(data => {
            if (type === "table") {
                const table = document.createElement("table");
                table.className = "table table-bordered mb-3";

                const tbody = document.createElement("tbody");
                for (const key in data) {
                    const row = document.createElement("tr");
                    row.innerHTML = `<th>${key}</th><td>${data[key]}</td>`;
                    tbody.appendChild(row);
                }

                table.appendChild(tbody);
                container.appendChild(table);
            }
            else if (type === "list") {
                const item = document.createElement("div");
                item.className = "list-group-item bg-body";

                const row = document.createElement("div");
                row.className = "row";

                for (const key in data) {
                    row.innerHTML += `
                        <div class="col">${key}</div>
                        <div class="col-auto">${data[key]}</div>`;
                }

                item.appendChild(row);
                container.appendChild(item);
            }
            else if (type === "card") {
                const card = document.createElement("div");
                card.className = "card mb-3";

                const body = document.createElement("div");
                body.className = "card-body";

                for (const key in data) {
                    body.innerHTML += `<p><strong>${key}</strong>: ${data[key]}</p>`;
                }

                card.appendChild(body);
                container.appendChild(card);
            }
        });

        // Clase general del contenedor
        container.className = (type === "list") ? "list-group mb-4" : "mb-4";
    }

    function submitSubForm(tabla, tipo) {
        const form = document.getElementById("SubValores_" + tabla);
        if (!form) return;

        if (!validateSubForm(tabla)) {
            console.warn("Formulario SubModelo no válido");
            return;
        }

        const { data, uniqueKeys } = getSubFormData(form);

        if (!subModelList[tabla]) {
            subModelList[tabla] = [];
        }

        const alreadyExists = subModelList[tabla].some(item =>
            uniqueKeys.every(u => item[u.key] === u.value)
        );

        if (alreadyExists) {
            alert("Ya existe un elemento con valores únicos duplicados.");
            return;
        }

        subModelList[tabla].push(data);

        const container = document.getElementById("render_" + tabla);
        renderSubFormDataList(container, subModelList[tabla], tipo);
    }

    return {
        validateSubForm,
        getSubFormData,
        submitSubForm,
        renderSubFormDataList,
        subModelList // puedes exponerlo si luego necesitas enviarlo o editar
    };
});
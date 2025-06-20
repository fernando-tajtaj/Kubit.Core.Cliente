function openModalForm(tipo) {
    fetch(`/MainForm?tipo=${encodeURIComponent(tipo)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar el formulario");
            }
            return response.text();
        })
        .then(html => {
            // Verifica si el contenido está vacío o contiene un error específico
            if (!html || html.includes("El template recibido es null")) {
                throw new Error("El formulario no se pudo cargar correctamente.");
            }

            // Si el modal principal no existe, lo crea
            if (!document.getElementById('mainFormModal')) {
                const modalHTML = `
                <div class="modal fade" id="mainFormModal" tabindex="-1" aria-labelledby="mainFormModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="mainFormModalLabel">Agregar</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                            </div>
                            <div class="modal-body" id="mainFormModalBody">
                            </div>
                                <div class="modal-footer d-grid gap-2 d-md-flex justify-content-md-end">
                                  <button class="btn btn-light me-md-2" type="submit" onclick="submitForm(event)">Guardar</button>
                                  <button class="btn btn-light" type="button" data-bs-dismiss="modal">Salir</button>
                                </div>
                        </div>
                    </div>
                </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }

            // Cargar HTML en el modal y mostrarlo
            document.getElementById('mainFormModalBody').innerHTML = html;
            const modal = new bootstrap.Modal(document.getElementById('mainFormModal'));
            modal.show();
        })
        .catch(error => {
            // Mostrar modal con mensaje de error personalizado
            showErrorModal("Error al cargar el formulario. Intenta más tarde.");
        });
}
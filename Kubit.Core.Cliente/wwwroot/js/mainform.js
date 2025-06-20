function showSuccessModal(message) {
    if (!document.getElementById('successModal')) {
        const modalHTML = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="successModalLabel">Éxito</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p id="successModalBody">${message}</p>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        document.getElementById('successModalBody').textContent = message;
    }

    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

function showErrorModal(message) {
    // Si el modal no existe, lo creamos
    if (!document.getElementById('errorModal')) {
        const modalErrorHTML = `
        <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="errorModalLabel">Error</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p id="errorModalMessage">${message}</p>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalErrorHTML);
    } else {
        document.getElementById('errorModalMessage').textContent = message;
    }

    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}

async function submitForm(event) {
    event.preventDefault();

    const form = document.getElementById('mainForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }

    const formData = new FormData(form);

    try {
        const response = await fetch('/MainForm', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Cerrar modal principal
            const modalElement = document.getElementById('mainFormModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            // Mostrar modal de éxito
            showSuccessModal(result.message, true);

            // Refrescar el grid si existe
            if (typeof refreshGrid === 'function') {
                refreshGrid();
            }
        } else {
            // Mostrar modal de error
            showErrorModal(result.message);
        }
    } catch (error) {
        showErrorModal('Error enviando formulario: ' + error.message);
    }

    return false;
}
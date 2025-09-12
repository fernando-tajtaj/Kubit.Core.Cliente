define([], function () {
    function addPhoto(subKey, grid) {
        const input = document.getElementById(subKey);
        const previewDiv = document.getElementById('div_files_' + grid);

        if (!input || !previewDiv || !input.files.length) return;

        let filesArray = [];

        Array.from(input.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                filesArray.push(file);
            }
        });

        function renameFilesWithUuid() {
            filesArray = filesArray.map(file => {
                const extension = file.name.split('.').pop();
                const uuid = crypto.randomUUID().replace(/-/g, '');
                const newName = `${uuid}.${extension}`;
                return new File([file], newName, { type: file.type });
            });
            updateInputFiles();
        }

        function updateInputFiles() {
            const dataTransfer = new DataTransfer();
            filesArray.forEach(file => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
        }

        function renderPreviews() {
            previewDiv.innerHTML = '';
            filesArray.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const container = document.createElement('div');
                    container.style.cssText = 'position:relative;display:inline-block;margin:5px;text-align:center';

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.cssText = 'width:120px;height:120px;object-fit:cover';
                    img.classList.add('rounded', 'border');

                    const btnRemove = document.createElement('button');
                    btnRemove.type = 'button';
                    btnRemove.title = 'Eliminar imagen';
                    btnRemove.style.cssText = `
                        position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.4);
                        border-radius:50%;width:28px;height:28px;display:flex;
                        align-items:center;justify-content:center;color:white;
                        cursor:pointer;border:none;padding:0;font-size:20px;user-select:none;
                    `;
                    btnRemove.innerHTML = '<span class="material-symbols-outlined fs-5">delete</span>';
                    btnRemove.addEventListener('click', function () {
                        filesArray.splice(index, 1);
                        renderPreviews();
                        updateInputFiles();
                    });

                    container.appendChild(img);
                    container.appendChild(btnRemove);
                    previewDiv.appendChild(container);
                };
                reader.readAsDataURL(file);
            });
        }

        renameFilesWithUuid();
        renderPreviews();
    }

    async function uploadPhotos(inputId) {
        const input = document.getElementById(inputId);
        if (!input || !input.files.length) return;

        const formData = new FormData();
        Array.from(input.files).forEach(file => formData.append("files", file));

        const response = await fetch("/api/photos/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error uploading photos");
        }

        return await response.json();
    }

    return {
        addPhoto,
        uploadPhotos
    };
});
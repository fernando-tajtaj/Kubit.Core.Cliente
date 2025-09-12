define([], function () {
    function enabledCtrl(ctrlEnabledStr, valEnabledStr, valDisabledStr, controlId) {
        const trigger = document.getElementById(controlId);

        if (!trigger) {
            console.warn(`No se encontró el control con ID: ${controlId}`);
            return;
        }

        const ctrlEnabled = ctrlEnabledStr.split('|');
        const valEnabled = valEnabledStr.split('|');
        const valDisabled = valDisabledStr.split('|');

        let value;

        if (trigger.type === 'checkbox') {
            value = trigger.checked ? '1' : '0';
        } else if (trigger.type === 'radio') {
            const selected = document.querySelector(`input[name="${trigger.name}"]:checked`);
            value = selected ? selected.value : '';
        } else {
            value = trigger.value.trim();
        }

        const index = ctrlEnabled.indexOf(value);
        if (index === -1) return;

        // Habilitar controles
        if (valEnabled[index]) {
            valEnabled[index].split(',').forEach(id => {
                const groupId = `div_${id}`;
                groupDisabled(groupId, false);
            });
        }

        // Deshabilitar controles
        if (valDisabled[index]) {
            valDisabled[index].split(',').forEach(id => {
                const groupId = `div_${id}`;
                groupDisabled(groupId, true);
            });
        }
    }

    function groupDisabled(groupId, isDisabled) {
        const group = document.getElementById(groupId);
        if (!group) return;

        const elements = group.querySelectorAll('input, button, select, textarea');
        elements.forEach(el => el.disabled = isDisabled);
    }

    // Exportar funciones
    return {
        enabledCtrl,
        groupDisabled
    };
});
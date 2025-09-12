define([], function () {
    function validateMaxLength(range, inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const val = input.value.trim();

        // Parsear rango si viene en formato "min-max" o {min:..., max:...}
        let min, max;
        if (typeof range === 'string') {
            const parts = range.split('-').map(s => parseInt(s.trim(), 10));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                min = parts[0];
                max = parts[1];
            }
        } else if (typeof range === 'object') {
            min = range.min;
            max = range.max;
        }

        // Validar que el valor sea entero y esté dentro del rango
        const num = parseInt(val, 10);

        if (
            val === '' ||
            (Number.isInteger(num) && num >= min && num <= max && val.length === 1)
        ) {
            // válido, no hacer nada
            return;
        } else {
            // inválido, eliminar último carácter
            input.value = val.slice(0, -1);
        }
    }

    function validatePrecisionScale(precision, scale, inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        let value = input.value;

        // Permitir solo dígitos y un solo punto
        const parts = value.split('.');

        let intPart = parts[0].replace(/\D/g, '');
        let decPart = parts[1]?.replace(/\D/g, '') ?? '';

        const maxInt = precision;

        intPart = intPart.slice(0, maxInt);
        decPart = decPart.slice(0, scale);

        // Reconstruir valor según si el usuario está escribiendo el punto
        if (parts.length === 2 || value.endsWith('.')) {
            input.value = `${intPart}.${decPart}`;
        } else {
            input.value = intPart;
        }
    }

    return {
        validateMaxLength,
        validatePrecisionScale
    };
});
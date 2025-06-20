function selectDropdownOption(fieldId, value, label) {
    document.getElementById(`ddl_${fieldId}`).innerText = label;
    document.getElementById(`hidden_${fieldId}`).value = value;
}
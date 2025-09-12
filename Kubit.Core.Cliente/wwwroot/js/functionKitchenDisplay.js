define([], function () {
    function renderOrder(order) {
        const template = document.getElementById("orderCardTemplate").innerHTML;
        let html = template
            .replaceAll("{{id}}", order.id)
            .replace("{{plato}}", order.plato)
            .replace("{{cantidad}}", order.cantidad)
            .replace("{{hora}}", order.hora)
            .replace("{{estado}}", order.estado);

        const container = document.getElementById("ordersContainer");
        container.insertAdjacentHTML("afterbegin", html);
    }

    function markAsReady(id) {
        const card = document.querySelector(`[data-order-id='${id}']`);
        if (!card) return;

        const badge = card.querySelector(".badge");
        badge.classList.remove("bg-warning");
        badge.classList.add("bg-success");
        badge.textContent = "Listo";

        const btn = card.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Entregado ✅";
    }
    return {
        renderOrder,
        markAsReady
    };
});
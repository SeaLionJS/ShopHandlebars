const toCurrency = (value) =>
  new Intl.NumberFormat("ru-RU", {
    currency: "rub",
    style: "currency",
  }).format(value);

document.querySelectorAll(".price").forEach((node) => {
  node.textContent = toCurrency(node.textContent);
});

const toDate = (value) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));

document.querySelectorAll(".date").forEach((node) => {
  node.textContent = toDate(node.textContent);
});

const tinstance = M.Tabs.init(document.querySelectorAll(".tabs"));

const $cart = document.getElementById("cart");

if ($cart) {
  $cart.addEventListener("click", (e) => {
    if (e.target.classList.contains("js-remove")) {
      const id = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;
      console.log(id);

      fetch("cart/remove/" + id, {
        method: "delete",
        headers: { "X-XSRF-TOKEN": csrf },
      })
        .then((res) => res.json())
        .then((cart) => {
          console.log(cart);
          if (cart.courses.length) {
            const html = cart.courses
              .map((c) => {
                return `
                    <tr>
                        <td>${c.title}</td>
                        <td>${c.count}</td>
                        <td><button class="btn btn-small js-remove" data-id="${c.id}">Delete</button></td>
                    </tr>
                `;
              })
              .join("");

            $cart.querySelector("tbody").innerHTML = html;
            $cart.querySelector(".price").innerHTML = toCurrency(cart.price);
          } else {
            $cart.innerHTML = "<p>Cart is empty</p>";
          }
        });
    }
  });
}

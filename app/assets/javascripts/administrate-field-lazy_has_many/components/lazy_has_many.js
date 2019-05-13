function bindLazyHasManys() {
  const lazySelects = document.querySelectorAll(
    '[data-component="lazy-has-many"]'
  );

  lazySelects.forEach(lazySelect => {
    const input = lazySelect.querySelector('input[type="search"]');
    const selected = lazySelect.querySelector(".selected");
    const popout = lazySelect.querySelector('[data-target="popout"]');
    const output = lazySelect.querySelector('[data-target="output"]');
    const select = output.querySelector(".results-select");
    const options = JSON.parse(lazySelect.getAttribute("data-lazy-has-many"));

    let controller = undefined;
    let lastResult = undefined;
    let lastDebounce = undefined;

    function onQuery(event) {
      const value = event.currentTarget.value;
      console.log(value);

      if (controller) {
        controller.abort();
      }

      if (lastDebounce) {
        clearTimeout(lastDebounce);
      }

      controller = new AbortController();
      const { signal } = controller;

      lastDebounce = setTimeout(() => {
        lastDebounce = undefined;

        fetch(options.url.replace("{q}", value).replace("%7Bq%7D", value), {
          signal,
          headers: { Accept: "application/json" }
        })
          .then(r => r.json())
          .then(r =>
            r.map(e => ({ value: e[options.value], label: e[options.label] }))
          )
          .then(rs => {
            const currentResult = JSON.stringify(rs);

            if (lastResult && lastResult === currentResult) {
              return;
            }

            lastResult = currentResult;

            while (select.lastChild) {
              select.removeChild(select.lastChild);
            }

            // const currentValue = event.currentTarget.value

            rs.forEach(r => {
              const option = document.createElement("option");
              option.setAttribute("value", r.value);
              option.innerText = r.label;
              select.appendChild(option);
            });

            select.setAttribute(
              "size",
              "" +
                Math.max(
                  2,
                  Math.min(
                    Number(select.getAttribute("data-max-size")),
                    rs.length
                  )
                )
            );
          })
          .catch(error => {
            if (error.name === "AbortError") {
              return; /* ignore, this is an aborted promise */
            }
            console.error(error);
          });
      }, 250);
    }

    function showPopout() {
      popout.classList.add("active");
      input.focus()
    }

    function hidePopout() {
      popout.classList.remove("active");
    }

    input.addEventListener("input", onQuery);
    selected.addEventListener("click", showPopout);

    document.addEventListener("click", e => {
      const lazy =
        e.target && e.target.closest('[data-component="lazy-has-many"]');
      if (lazy !== lazySelect) {
        hidePopout();
      }
    });

    select.addEventListener("click", e => {
      option = new Option(
        e.currentTarget.selectedOptions[0].textContent,
        e.currentTarget.value,
        false,
        true
      );
      selected.append(option);
      for (var i=0; i<selected.options.length; i++) {
        selected.options[i].selected = true;
      }
      hidePopout();
    });

    selected.removeAttribute("disabled");
  });
}

if (window.Turbolinks && window.Turbolinks.supported) {
  document.addEventListener("turbolinks:load", function() {
    bindLazyHasManys();
  });
} else {
  document.addEventListener("DOMContentLoaded", bindLazyHasManys);
}

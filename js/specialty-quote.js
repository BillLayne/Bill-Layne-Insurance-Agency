(() => {
  "use strict";
  const kind = document.body.dataset.quoteKind,
    schema = SpecialtySchema[kind];
  const form = document.getElementById("specialty-form"),
    root = document.getElementById("specialty-steps");
  const next = document.getElementById("next-btn"),
    back = document.getElementById("back-btn"),
    error = document.getElementById("error-summary");
  const names = [
    "About you",
    schema.assetTitle + " details",
    schema.operatorTitle + " details",
    "Coverage preferences",
    "Review & send",
  ];
  const steps = [],
    groups = { applicant: [], assets: [], operators: [], coverage: [] };
  let step = 0,
    editing = false,
    sending = false,
    settled = false,
    uid = 0;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function groupValues(group) {
    return Object.fromEntries(
      group.fields.map(({ field, input }) => [field.key, input.value.trim()]),
    );
  }
  function conditions(group) {
    const values = groupValues(group);
    group.fields.forEach(({ field, input, wrap }) => {
      const active = specialtyActive(field, values);
      wrap.hidden = !active;
      input.disabled = !active;
    });
  }
  function addGroup(key, container, defaults = {}) {
    const group = {
      fields: [],
      node: el(
        "div",
        key === "assets" || key === "operators" ? "repeat-card" : "field-grid",
      ),
    };
    const repeat = key === "assets" || key === "operators";
    if (repeat) {
      const head = el("div", "repeat-head");
      group.heading = el("h3");
      head.append(group.heading);
      group.remove = el("button", "remove-btn", "Remove");
      group.remove.type = "button";
      head.append(group.remove);
      group.node.append(head);
    }
    const fields = repeat ? el("div", "field-grid") : group.node;
    schema[key].forEach((field) => {
      const wrap = el("div", "field"),
        id = "specialty-" + ++uid,
        label = el(
          "label",
          "",
          field.label + (field.required ? " *" : " (optional)"),
        );
      label.htmlFor = id;
      const input = el(
        field.type === "select"
          ? "select"
          : field.type === "textarea"
            ? "textarea"
            : "input",
      );
      if (input.tagName === "INPUT") input.type = field.type;
      input.id = id;
      input.name = key + "_" + uid + "_" + field.key;
      input.dataset.key = field.key;
      input.required = field.required;
      if (field.type === "select") {
        const blank = el("option", "", "Select an answer");
        blank.value = "";
        input.append(blank);
        field.options.forEach((value) => {
          const option = el("option", "", value);
          option.value = value;
          input.append(option);
        });
      }
      [
        "min",
        "max",
        "step",
        "maxLength",
        "pattern",
        "inputmode",
        "autocomplete",
      ].forEach((attr) => {
        if (field[attr] !== undefined) input.setAttribute(attr, field[attr]);
      });
      if (field.type === "date") {
        if (field.dateRule === "birth") {
          input.min = "1900-01-01";
          input.max = today;
        }
        if (field.dateRule === "future") input.min = today;
      }
      if (field.type === "textarea") input.rows = 3;
      input.value = defaults[field.key] ?? field.default ?? "";
      const message = el("p", "field-error");
      message.id = id + "-error";
      message.hidden = true;
      input.setAttribute(
        "aria-describedby",
        message.id + (field.hint ? " " + id + "-hint" : ""),
      );
      wrap.append(label, input);
      if (field.hint) {
        const hint = el("p", "hint", field.hint);
        hint.id = id + "-hint";
        wrap.append(hint);
      }
      wrap.append(message);
      fields.append(wrap);
      group.fields.push({ field, input, wrap, message });
    });
    if (repeat) group.node.append(fields);
    container.append(group.node);
    groups[key].push(group);
    group.node.addEventListener("change", () => conditions(group));
    conditions(group);
    if (repeat) {
      group.remove.addEventListener("click", () => {
        groups[key].splice(groups[key].indexOf(group), 1);
        group.node.remove();
        renumber(key);
        document.getElementById("add-" + key).focus();
      });
      renumber(key);
    }
    return group;
  }
  function renumber(key) {
    groups[key].forEach((g, i) => {
      g.heading.textContent =
        (key === "assets" ? schema.assetTitle : schema.operatorTitle) +
        " " +
        (i + 1);
      g.remove.hidden = groups[key].length === 1;
      g.remove.setAttribute("aria-label", "Remove " + g.heading.textContent);
    });
    const add = document.getElementById("add-" + key);
    if (add) add.disabled = groups[key].length >= (key === "assets" ? 3 : 6);
  }
  names.forEach((name, i) => {
    const section = el("section", "form-step");
    section.hidden = i !== 0;
    const heading = el("div", "step-heading"),
      h = el("h2", "", name);
    h.id = "specialty-step-" + i;
    h.tabIndex = -1;
    section.setAttribute("aria-labelledby", h.id);
    heading.append(
      h,
      el(
        "p",
        "",
        [
          "Your contact information and requested start date.",
          "Add each item you want quoted. Estimates are fine where noted.",
          "Include every regular rider or operator, even if they are not the applicant.",
          "These are preferences for an agent to review, not a coverage selection.",
          "Check your details. You can edit any section before sending.",
        ][i],
      ),
    );
    section.append(heading);
    if (i < 4)
      section.append(el("p", "required-note", "Fields marked * are required."));
    root.append(section);
    steps.push(section);
  });
  addGroup("applicant", steps[0]);
  [
    ["assets", 1],
    ["operators", 2],
  ].forEach(([key, index]) => {
    const container = el("div");
    steps[index].append(container);
    const add = el(
      "button",
      "add-btn",
      "+ Add another " +
        (key === "assets"
          ? schema.assetTitle
          : schema.operatorTitle
        ).toLowerCase(),
    );
    add.type = "button";
    add.id = "add-" + key;
    steps[index].append(
      add,
      el(
        "p",
        "hint",
        "More than " +
          (key === "assets" ? 3 : 6) +
          "? Add a note in Coverage or call our agency.",
      ),
    );
    add.addEventListener("click", () => {
      if (groups[key].length >= (key === "assets" ? 3 : 6)) return;
      const g = addGroup(
        key,
        container,
        key === "operators" ? { same_as_applicant: "No" } : {},
      );
      g.fields[0].input.focus();
    });
    addGroup(
      key,
      container,
      key === "operators"
        ? { same_as_applicant: "Yes", relationship: "Self" }
        : {},
    );
  });
  addGroup("coverage", steps[3]);
  const review = el("div", "review");
  review.id = "review-content";
  review.setAttribute("data-clarity-mask", "true");
  steps[4].append(review);
  const consent = el("label", "bundle-choice"),
    check = el("input");
  check.type = "checkbox";
  check.id = "confirm-accuracy";
  consent.append(
    check,
    el(
      "span",
      "",
      "I have reviewed these details and authorize Bill Layne Insurance to contact me about this quote request.",
    ),
  );
  steps[4].append(
    consent,
    el(
      "p",
      "disclosure",
      "This request does not bind, change or cancel insurance. An agent will confirm eligibility, available coverage and your start date. Carrier-specific details or documents may still be needed. Please do not enter Social Security, bank account or payment card information.",
    ),
  );
  function clearErrors() {
    error.hidden = true;
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((n) => n.removeAttribute("aria-invalid"));
    form.querySelectorAll(".field-error").forEach((n) => (n.hidden = true));
  }
  function validate(index) {
    clearErrors();
    let first = null,
      count = 0;
    const keys = [["applicant"], ["assets"], ["operators"], ["coverage"], []][
      index
    ];
    keys.forEach((key) =>
      groups[key].forEach((group) => {
        conditions(group);
        group.fields.forEach(({ field, input, message }) => {
          if (input.disabled) return;
          const problem = specialtyFieldError(field, input.value, today);
          if (problem) {
            input.setAttribute("aria-invalid", "true");
            message.textContent = problem;
            message.hidden = false;
            first ||= input;
            count++;
          }
        });
      }),
    );
    if (
      index === 2 &&
      groups.operators.filter((g) => groupValues(g).same_as_applicant === "Yes")
        .length > 1
    ) {
      first = groups.operators[1].fields[0].input;
      error.textContent =
        "List the applicant once. Choose No for other operators.";
      error.hidden = false;
    } else if (index === 4 && !check.checked) {
      first = check;
      error.textContent = "Please confirm you reviewed your details.";
      error.hidden = false;
    } else if (first) {
      error.textContent =
        "Please check " +
        count +
        " highlighted answer" +
        (count === 1 ? "" : "s") +
        ".";
      error.hidden = false;
    }
    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView({ block: "center", behavior: "instant" });
      return false;
    }
    return true;
  }
  function payload() {
    const out = {
      form_type: kind + "_insurance",
      confirm_accuracy: check.checked,
      cta_source: /^[a-z0-9_-]{1,80}$/i.test(params.get("src") || "")
        ? params.get("src")
        : kind + "_quote",
    };
    Object.keys(groups).forEach((key) => {
      const rows = groups[key].map((g) => {
        const values = groupValues(g);
        return Object.fromEntries(
          g.fields
            .filter(({ field }) => specialtyActive(field, values))
            .map(({ field, input }) => [field.key, input.value.trim()]),
        );
      });
      out[key] = key === "applicant" || key === "coverage" ? rows[0] : rows;
    });
    return out;
  }
  function renderReview() {
    review.replaceChildren();
    ["applicant", "assets", "operators", "coverage"].forEach((key, index) =>
      groups[key].forEach((group, num) => {
        const section = el("section", "review-section"),
          head = el("header"),
          title =
            names[index] + (groups[key].length > 1 ? " " + (num + 1) : ""),
          edit = el("button", "edit-btn", "Edit");
        edit.type = "button";
        edit.setAttribute("aria-label", "Edit " + title);
        edit.addEventListener("click", () => {
          editing = true;
          show(index);
        });
        head.append(el("h4", "", title), edit);
        section.append(head);
        const dl = el("dl"),
          values = groupValues(group);
        group.fields.forEach(({ field, input }) => {
          if (!specialtyActive(field, values)) return;
          const row = el("div");
          let answer = input.value.trim() || "Not provided";
          if (field.key === "same_as_applicant" && answer === "Yes") {
            const a = groupValues(groups.applicant[0]);
            answer =
              "Yes — " +
              a.firstname +
              " " +
              a.lastname +
              "; DOB " +
              a.date_of_birth;
          }
          row.append(el("dt", "", field.label), el("dd", "", answer));
          dl.append(row);
        });
        section.append(dl);
        review.append(section);
      }),
    );
  }
  function show(index, focus = true) {
    step = index;
    clearErrors();
    steps.forEach((s, i) => (s.hidden = i !== index));
    document.getElementById("step-caption").textContent =
      "Step " + (index + 1) + " of 5";
    document.getElementById("step-name").textContent = names[index];
    document.getElementById("progress-fill").style.width =
      (index + 1) * 20 + "%";
    document.querySelectorAll(".step-list li").forEach((n, i) => {
      n.classList.toggle("done", i < index);
      if (i === index) n.setAttribute("aria-current", "step");
      else n.removeAttribute("aria-current");
    });
    back.hidden = index === 0 && !editing;
    next.textContent = settled
      ? "Call to confirm receipt"
      : editing
        ? "Save & review →"
        : index === 4
          ? "Send my request →"
          : "Continue →";
    next.disabled = settled;
    document.getElementById("next-hint").textContent = settled
      ? "Your answers are preserved. Call before resubmitting."
      : editing
        ? "Your other answers stay in place"
        : index === 4
          ? "A quote request does not bind coverage"
          : "Next: " + names[index + 1];
    if (index === 4) renderReview();
    if (focus) {
      const h = steps[index].querySelector("h2");
      h.focus({ preventScroll: true });
      h.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  async function advance() {
    if (sending || settled) return;
    if (!validate(step)) return;
    if (editing) {
      editing = false;
      show(4);
      return;
    }
    if (step < 4) {
      show(step + 1);
      return;
    }
    for (let i = 0; i < 5; i++) {
      show(i, false);
      if (!validate(i)) return;
    }
    show(4, false);
    let data;
    try {
      data = validateSpecialtyQuote(payload(), today);
    } catch {
      error.textContent = "Please review your details before sending.";
      error.hidden = false;
      return;
    }
    sending = true;
    next.disabled = true;
    back.disabled = true;
    next.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");
    const enabled = [
      ...form.querySelectorAll("input,select,textarea,button"),
    ].filter((n) => !n.disabled);
    enabled.forEach((n) => (n.disabled = true));
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/quote-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json();
      if (
        !response.ok ||
        result.ok !== true ||
        result.quoteType !== schema.receipt ||
        !new RegExp("^" + schema.receipt + "-[0-9]{6}-[A-Z0-9]{4}$").test(
          result.confirmationNumber || "",
        )
      )
        throw new Error("Unconfirmed");
      settled = true;
      document.getElementById("confirmation-number").textContent =
        result.confirmationNumber;
      form.hidden = true;
      document.getElementById("form-actions").hidden = true;
      document.querySelector(".progress").hidden = true;
      document.getElementById("quote-complete").hidden = false;
      const h = document.getElementById("complete-title");
      h.focus({ preventScroll: true });
      h.scrollIntoView({ block: "start", behavior: "instant" });
      try {
        if (typeof window.gtag === "function") {
          const detail = {
            form_name: kind + "_quote",
            service_line: kind,
            method: "backend_acknowledged",
            cta_source: data.cta_source,
          };
          window.gtag("event", "form_submit", detail);
          window.gtag("event", "generate_lead", detail);
        }
      } catch {}
    } catch {
      settled = true;
      const alert = document.getElementById("submission-error");
      alert.hidden = false;
      alert.focus({ preventScroll: true });
      alert.scrollIntoView({ block: "center", behavior: "instant" });
      next.textContent = "Call to confirm receipt";
      document.getElementById("next-hint").textContent =
        "Your answers are preserved. Call before resubmitting.";
    } finally {
      clearTimeout(timer);
      sending = false;
      form.removeAttribute("aria-busy");
      enabled.forEach((n) => (n.disabled = false));
      back.disabled = false;
      next.disabled = true;
    }
  }
  next.addEventListener("click", advance);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    advance();
  });
  back.addEventListener("click", () => {
    if (editing) {
      editing = false;
      show(4);
    } else show(Math.max(0, step - 1));
  });
  const params = new URLSearchParams(location.search),
    zip = params.get("zip");
  if (/^\d{5}$/.test(zip || ""))
    groups.applicant[0].fields.find(
      (x) => x.field.key === "zip_code",
    ).input.value = zip;
  const choices = new URL("/get-quote", location.href);
  for (const key of ["zip", "src"]) {
    const val = params.get(key);
    if (val && (key === "zip" ? /^\d{5}$/ : /^[a-z0-9_-]{1,80}$/i).test(val))
      choices.searchParams.set(key, val);
  }
  document.getElementById("coverage-link").href = choices.href;
  if (window.visualViewport) {
    const height = innerHeight;
    const keyboard = () =>
      document.body.classList.toggle(
        "keyboard-open",
        /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName) &&
          height - visualViewport.height > 150,
      );
    visualViewport.addEventListener("resize", keyboard);
    document.addEventListener("focusout", () =>
      requestAnimationFrame(keyboard),
    );
  }
  next.disabled = false;
  show(0, false);
})();

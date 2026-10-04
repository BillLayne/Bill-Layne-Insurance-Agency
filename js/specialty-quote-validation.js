// Pure validation shared by the browser and private Apps Script backend.
function specialtyActive(field, values) {
  if (!field.when) return true;
  var allowed = Array.isArray(field.when[1]) ? field.when[1] : [field.when[1]];
  return allowed.indexOf(values[field.when[0]]) !== -1;
}
function specialtyFieldError(field, value, today) {
  if (typeof value !== "string") return "Please check this answer.";
  value = value.trim();
  if (!value) return field.required ? "Please complete this field." : "";
  if (value.length > (field.maxLength || 600))
    return "Please shorten this answer.";
  if (
    /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value) ||
    (field.type !== "textarea" && /[\r\n]/.test(value))
  )
    return "Please remove unusual characters.";
  if (field.options && field.options.indexOf(value) === -1)
    return "Choose an available option.";
  if (field.type === "number") {
    var n = Number(value);
    if (
      !/^\d+(\.\d+)?$/.test(value) ||
      !isFinite(n) ||
      n < field.min ||
      n > field.max ||
      (field.step !== "0.1" && !Number.isInteger(n))
    )
      return "Enter a number from " + field.min + " to " + field.max + ".";
  }
  if (field.type === "date") {
    var date = new Date(value + "T12:00:00Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      return "Enter a valid date.";
    if (field.dateRule === "birth" && (value >= today || value < "1900-01-01"))
      return "Enter a birth date before today.";
    if (field.dateRule === "future" && value < today)
      return "Choose today or a future date.";
  }
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a complete email address.";
  if (field.type === "tel" && !/^(?:1)?\d{10}$/.test(value.replace(/\D/g, "")))
    return "Enter a 10-digit phone number with area code.";
  if (field.pattern && !new RegExp("^(?:" + field.pattern + ")$").test(value))
    return field.key === "zip_code"
      ? "Enter a 5-digit ZIP code."
      : "Please check the letters and numbers.";
  return "";
}
function validateSpecialtyQuote(input, today) {
  if (
    !input ||
    !["motorcycle_insurance", "boat_insurance"].includes(input.form_type)
  )
    throw new Error("Invalid quote type");
  var kind = input.form_type.replace("_insurance", "");
  var schema = SpecialtySchema[kind];
  function clean(fields, values) {
    if (!values || typeof values !== "object" || Array.isArray(values))
      throw new Error("Invalid details");
    var out = {};
    fields.forEach(function (field) {
      if (!specialtyActive(field, values)) return;
      var value = values[field.key] === undefined ? "" : values[field.key];
      if (specialtyFieldError(field, value, today))
        throw new Error("Invalid field: " + field.key);
      out[field.key] = value.trim();
    });
    return out;
  }
  var data = {
    form_type: input.form_type,
    applicant: clean(schema.applicant, input.applicant),
    coverage: clean(schema.coverage, input.coverage),
  };
  [
    ["assets", 3],
    ["operators", 6],
  ].forEach(function (pair) {
    var key = pair[0];
    if (
      !Array.isArray(input[key]) ||
      !input[key].length ||
      input[key].length > pair[1]
    )
      throw new Error("Invalid " + key + " count");
    data[key] = input[key].map(function (row) {
      return clean(schema[key], row);
    });
  });
  data.operators.forEach(function (row) {
    if (row.same_as_applicant === "Yes")
      ["firstname", "lastname", "date_of_birth"].forEach(function (key) {
        row[key] = data.applicant[key];
      });
  });
  if (
    data.operators.filter(function (row) {
      return row.same_as_applicant === "Yes";
    }).length > 1
  )
    throw new Error("Applicant listed more than once");
  if (input.confirm_accuracy !== true)
    throw new Error("Review confirmation required");
  data.confirm_accuracy = true;
  data.cta_source = input.cta_source || kind + "_quote";
  if (
    typeof data.cta_source !== "string" ||
    !/^[a-z0-9_-]{1,80}$/i.test(data.cta_source)
  )
    throw new Error("Invalid attribution");
  return data;
}

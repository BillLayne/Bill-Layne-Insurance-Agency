(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const vinForm = $("vin-form");
  const vinInput = $("vin-input");
  const vinCount = $("vin-count");
  const vinMessage = $("vin-message");
  const decodeButton = $("decode-button");
  const resultsSection = $("results");
  const vehicleName = $("vehicle-name");
  const vinEnding = $("vin-ending");
  const vehicleDetails = $("vehicle-details");
  const decodeWarning = $("decode-warning");
  const resultStatus = $("result-status");
  const recallContent = $("recall-content");
  const safetyContent = $("safety-content");
  const fuelContent = $("fuel-content");
  const exactRecallLink = $("exact-recall-link");
  const resetButton = $("reset-button");
  const vinTab = $("vin-tab");
  const plateTab = $("plate-tab");
  const vinPanel = $("vin-panel");
  const platePanel = $("plate-panel");
  const scanVinButton = $("scan-vin-button");
  const scanPlateButton = $("scan-plate-button");
  const vinPhoto = $("vin-photo");
  const platePhoto = $("plate-photo");
  const plateResult = $("plate-result");
  const plateText = $("plate-text");
  const plateMessage = $("plate-message");
  const plateHandoff = $("plate-handoff");
  const ocrOverlay = $("ocr-overlay");
  const ocrProgress = $("ocr-progress");
  const ocrCancel = $("ocr-cancel");

  const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
  const VIN_TRANSLITERATION = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const UNKNOWN = "Not available";
  let activeController = null;
  let ocrJob = 0;
  let lastPlate = "";
  let currentVin = "";
  let activeOcrWorker = null;
  let ocrReturnFocus = null;

  function track(eventName) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, {
      event_category: "free_vehicle_tool",
      page_location: window.location.href,
    });
  }

  function normalizeVin(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 17);
  }

  function getVinCheckDigit(vin) {
    if (!VIN_PATTERN.test(vin)) return "";
    const total = [...vin].reduce((sum, character, index) => {
      const value = /\d/.test(character) ? Number(character) : VIN_TRANSLITERATION[character];
      return sum + value * VIN_WEIGHTS[index];
    }, 0);
    const remainder = total % 11;
    return remainder === 10 ? "X" : String(remainder);
  }

  function validateVin(value) {
    const vin = normalizeVin(value);
    if (vin.length !== 17) return { valid: false, vin, message: "Enter all 17 VIN characters." };
    if (!VIN_PATTERN.test(vin)) {
      return { valid: false, vin, message: "VINs cannot contain I, O or Q. Please check the characters." };
    }
    const expected = getVinCheckDigit(vin);
    if (expected && vin[8] !== expected) {
      return {
        valid: false,
        vin,
        message: `Please recheck character 9. The VIN check digit should be ${expected}.`,
      };
    }
    return { valid: true, vin, message: "VIN format looks correct." };
  }

  function setVinMessage(message, kind = "") {
    vinMessage.textContent = message;
    vinMessage.className = `field-message${kind ? ` ${kind}` : ""}`;
    vinInput.classList.toggle("invalid", kind === "error");
    vinInput.setAttribute("aria-invalid", kind === "error" ? "true" : "false");
  }

  function setMode(mode) {
    const isVin = mode === "vin";
    vinTab.classList.toggle("active", isVin);
    plateTab.classList.toggle("active", !isVin);
    vinTab.setAttribute("aria-selected", String(isVin));
    plateTab.setAttribute("aria-selected", String(!isVin));
    vinPanel.hidden = !isVin;
    platePanel.hidden = isVin;
    (isVin ? vinInput : scanPlateButton).focus();
  }

  function textValue(value, fallback = UNKNOWN) {
    const text = value === null || value === undefined ? "" : String(value).trim();
    return text || fallback;
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      signal: activeController?.signal,
      headers: { Accept: "application/json", ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }

  function makeDetail(label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = textValue(value);
    wrapper.append(term, description);
    return wrapper;
  }

  function renderVehicle(vehicle) {
    vehicleName.textContent = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
      .filter((value) => value && value !== UNKNOWN)
      .join(" ");
    vinEnding.textContent = `VIN ending in ${vehicle.vin.slice(-4)}`;
    vehicleDetails.replaceChildren();
    [
      ["Year", vehicle.year],
      ["Make", vehicle.make],
      ["Model", vehicle.model],
      ["Trim", vehicle.trim],
      ["Body style", vehicle.bodyClass],
      ["Vehicle type", vehicle.vehicleType],
      ["Drive type", vehicle.driveType],
      ["Fuel", vehicle.fuel],
      ["Engine", vehicle.engine],
      ["Cylinders", vehicle.cylinders],
      ["Transmission", vehicle.transmission],
      ["Doors", vehicle.doors],
      ["Manufacturer", vehicle.manufacturer],
      ["Built in", vehicle.plant],
      ["Front airbags", vehicle.frontAirbags],
      ["Side airbags", vehicle.sideAirbags],
      ["Curtain airbags", vehicle.curtainAirbags],
      ["Anti-lock brakes", vehicle.abs],
      ["Stability control", vehicle.esc],
      ["Tire pressure monitor", vehicle.tpms],
    ].forEach(([label, value]) => vehicleDetails.append(makeDetail(label, value)));

    if (vehicle.warnings.length) {
      decodeWarning.hidden = false;
      decodeWarning.textContent = `NHTSA returned a note: ${vehicle.warnings.join(" ")}`;
    } else {
      decodeWarning.hidden = true;
      decodeWarning.textContent = "";
    }
  }

  function renderEmpty(container, message) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = message;
    container.replaceChildren(empty);
  }

  function makeStat(label, value) {
    const row = document.createElement("div");
    row.className = "stat-row";
    const name = document.createElement("span");
    const result = document.createElement("strong");
    name.textContent = label;
    result.textContent = textValue(value);
    row.append(name, result);
    return row;
  }

  function renderRecalls(recalls) {
    if (!recalls.length) {
      renderEmpty(
        recallContent,
        "No model-level recall campaigns were returned. Use the exact VIN button below to confirm open recalls.",
      );
      return;
    }
    const count = document.createElement("p");
    count.className = "recall-count";
    count.textContent = `${recalls.length} campaign${recalls.length === 1 ? "" : "s"} may apply to this year, make and model.`;
    const list = document.createElement("div");
    list.className = "recall-list";
    recalls.forEach((recall) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `${recall.component} — ${recall.campaign}`;
      const body = document.createElement("div");
      body.className = "recall-body";
      [
        ["Summary", recall.summary],
        ["Why it matters", recall.consequence],
        ["Repair", recall.remedy],
      ].forEach(([label, value]) => {
        if (!value || value === UNKNOWN) return;
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        paragraph.append(strong, document.createTextNode(value));
        body.append(paragraph);
      });
      details.append(summary, body);
      list.append(details);
    });
    recallContent.replaceChildren(count, list);
  }

  function ratingStars(value) {
    const rating = Number.parseInt(value, 10);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return "Not rated";
    return `${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)`;
  }

  function renderSafety(rating) {
    if (!rating) {
      renderEmpty(safetyContent, "No matching NHTSA crash-test rating was available for this vehicle.");
      return;
    }
    const fragment = document.createDocumentFragment();
    fragment.append(
      makeStat("Overall", ratingStars(rating.overall)),
      makeStat("Front crash", ratingStars(rating.front)),
      makeStat("Side crash", ratingStars(rating.side)),
      makeStat("Rollover", ratingStars(rating.rollover)),
    );
    const note = document.createElement("p");
    note.className = "rating-note";
    note.textContent = `Matched NHTSA test variant: ${rating.description}. Confirm the body style and drivetrain.`;
    fragment.append(note);
    safetyContent.replaceChildren(fragment);
  }

  function renderFuel(fuel) {
    if (!fuel) {
      renderEmpty(fuelContent, "No matching EPA fuel-economy record was available for this vehicle.");
      return;
    }
    const fragment = document.createDocumentFragment();
    fragment.append(
      makeStat("City", fuel.city === UNKNOWN ? UNKNOWN : `${fuel.city} MPG`),
      makeStat("Highway", fuel.highway === UNKNOWN ? UNKNOWN : `${fuel.highway} MPG`),
      makeStat("Combined", fuel.combined === UNKNOWN ? UNKNOWN : `${fuel.combined} MPG`),
      makeStat("Fuel type", fuel.fuelType),
      makeStat("Drive", fuel.drive),
      makeStat("Transmission", fuel.transmission),
    );
    if (fuel.annualCost !== UNKNOWN) fragment.append(makeStat("Estimated annual fuel cost", `$${fuel.annualCost}`));
    const note = document.createElement("p");
    note.className = "rating-note";
    note.textContent = `Closest EPA option: ${fuel.option}. Estimates depend on driving and fuel prices.`;
    fragment.append(note);
    fuelContent.replaceChildren(fragment);
  }

  async function decodeVin(vin) {
    const payload = await fetchJson(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`,
    );
    const result = payload?.Results?.[0];
    if (!result || (!result.Make && !result.Model)) throw new Error("NHTSA could not identify this VIN.");
    const errorText = textValue(result.ErrorText, "");
    const warnings = errorText
      .split(";")
      .map((item) => item.trim())
      .filter((item) => item && !item.startsWith("0 -"));
    return {
      vin,
      year: textValue(result.ModelYear),
      make: textValue(result.Make),
      model: textValue(result.Model),
      trim: textValue(result.Trim),
      bodyClass: textValue(result.BodyClass),
      vehicleType: textValue(result.VehicleType),
      driveType: textValue(result.DriveType),
      fuel: textValue(result.FuelTypePrimary),
      cylinders: textValue(result.EngineCylinders),
      engine: result.DisplacementL ? `${result.DisplacementL}L ${textValue(result.EngineModel, "engine")}` : textValue(result.EngineModel),
      displacement: result.DisplacementL ? `${result.DisplacementL} L` : "",
      transmission: textValue(result.TransmissionStyle),
      doors: textValue(result.Doors),
      manufacturer: textValue(result.Manufacturer),
      plant: result.PlantCity
        ? [result.PlantCity, result.PlantState, result.PlantCountry].filter(Boolean).join(", ")
        : UNKNOWN,
      frontAirbags: textValue(result.AirBagLocFront),
      sideAirbags: textValue(result.AirBagLocSide),
      curtainAirbags: textValue(result.AirBagLocCurtain),
      abs: textValue(result.ABS),
      esc: textValue(result.ESC),
      tpms: textValue(result.TPMS),
      warnings,
    };
  }

  async function fetchRecalls(vehicle) {
    if ([vehicle.year, vehicle.make, vehicle.model].includes(UNKNOWN)) return [];
    const params = new URLSearchParams({
      make: vehicle.make,
      model: vehicle.model,
      modelYear: vehicle.year,
    });
    const payload = await fetchJson(`https://api.nhtsa.gov/recalls/recallsByVehicle?${params}`);
    const rows = payload?.Results || payload?.results || [];
    return rows.map((row) => ({
      campaign: textValue(row.NHTSACampaignNumber, "Campaign number unavailable"),
      component: textValue(row.Component, "Vehicle component"),
      summary: textValue(row.Summary),
      consequence: textValue(row.Conequence || row.Consequence),
      remedy: textValue(row.Remedy),
    }));
  }

  async function fetchSafety(vehicle) {
    if ([vehicle.year, vehicle.make, vehicle.model].includes(UNKNOWN)) return null;
    const year = encodeURIComponent(vehicle.year);
    const make = encodeURIComponent(vehicle.make);
    const model = encodeURIComponent(vehicle.model);
    const variants = await fetchJson(
      `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${make}/model/${model}?format=json`,
    );
    const rows = variants?.Results || [];
    if (!rows.length) return null;
    const doorNeedle = vehicle.doors.replace(/\D/g, "");
    const best = rows.find((row) => doorNeedle && String(row.VehicleDescription || "").includes(doorNeedle)) || rows[0];
    if (!best.VehicleId) return null;
    const detail = await fetchJson(
      `https://api.nhtsa.gov/SafetyRatings/VehicleId/${encodeURIComponent(best.VehicleId)}?format=json`,
    );
    const rating = detail?.Results?.[0];
    if (!rating) return null;
    return {
      description: textValue(rating.VehicleDescription || best.VehicleDescription, "NHTSA tested variant"),
      overall: textValue(rating.OverallRating, ""),
      front: textValue(rating.OverallFrontCrashRating, ""),
      side: textValue(rating.OverallSideCrashRating, ""),
      rollover: textValue(rating.RolloverRating, ""),
    };
  }

  async function fetchFuel(vehicle) {
    if ([vehicle.year, vehicle.make, vehicle.model].includes(UNKNOWN)) return null;
    const params = new URLSearchParams({ year: vehicle.year, make: vehicle.make, model: vehicle.model });
    const menu = await fetchJson(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?${params}`);
    const rawOptions = menu?.menuItem;
    const options = Array.isArray(rawOptions) ? rawOptions : rawOptions ? [rawOptions] : [];
    if (!options.length) return null;
    const cylinderNeedle = vehicle.cylinders !== UNKNOWN ? `${vehicle.cylinders} cyl` : "";
    const displacementNeedle = vehicle.displacement || "";
    const best = options.find((option) => {
      const label = String(option.text || "").toLowerCase();
      return (
        (!cylinderNeedle || label.includes(cylinderNeedle.toLowerCase())) &&
        (!displacementNeedle || label.includes(displacementNeedle.toLowerCase()))
      );
    }) || options[0];
    if (!best.value) return null;
    const detail = await fetchJson(`https://www.fueleconomy.gov/ws/rest/vehicle/${encodeURIComponent(best.value)}`);
    return {
      option: textValue(best.text, "EPA matching vehicle option"),
      city: textValue(detail.city08),
      highway: textValue(detail.highway08),
      combined: textValue(detail.comb08),
      annualCost: textValue(detail.fuelCost08),
      fuelType: textValue(detail.fuelType),
      drive: textValue(detail.drive),
      transmission: textValue(detail.trany),
    };
  }

  function setLoading(container) {
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.className = "loading-line";
    second.className = "loading-line short";
    container.replaceChildren(first, second);
  }

  async function handleDecode(event) {
    event.preventDefault();
    const validation = validateVin(vinInput.value);
    vinInput.value = validation.vin;
    vinCount.textContent = `${validation.vin.length}/17`;
    if (!validation.valid) {
      setVinMessage(validation.message, "error");
      vinInput.focus();
      return;
    }

    setVinMessage("Checking official vehicle data…", "success");
    decodeButton.disabled = true;
    decodeButton.textContent = "Decoding…";
    currentVin = "";
    exactRecallLink.href = "https://www.nhtsa.gov/recalls";
    resultStatus.className = "status-banner";
    resultStatus.textContent = "";
    activeController?.abort();
    activeController = new AbortController();
    track("vin_decoder_started");

    try {
      const vehicle = await decodeVin(validation.vin);
      currentVin = vehicle.vin;
      renderVehicle(vehicle);
      resultsSection.hidden = false;
      resultStatus.textContent = "Vehicle details found. Safety and fuel sources are still being checked.";
      setLoading(recallContent);
      setLoading(safetyContent);
      setLoading(fuelContent);
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

      const [recalls, safety, fuel] = await Promise.allSettled([
        fetchRecalls(vehicle),
        fetchSafety(vehicle),
        fetchFuel(vehicle),
      ]);
      if (recalls.status === "fulfilled") renderRecalls(recalls.value);
      else renderEmpty(recallContent, "Recall campaigns could not be loaded. Use the official VIN button below.");
      if (safety.status === "fulfilled") renderSafety(safety.value);
      else renderEmpty(safetyContent, "NHTSA safety ratings could not be loaded right now.");
      if (fuel.status === "fulfilled") renderFuel(fuel.value);
      else renderEmpty(fuelContent, "EPA fuel-economy information could not be loaded right now.");
      resultStatus.textContent = "Lookup complete. Review matched variants and confirm exact recalls on NHTSA.gov.";
      setVinMessage("Vehicle found.", "success");
      track("vin_decoder_completed");
    } catch (error) {
      if (error?.name === "AbortError") return;
      currentVin = "";
      exactRecallLink.href = "https://www.nhtsa.gov/recalls";
      resultsSection.hidden = false;
      vehicleName.textContent = "We could not decode that VIN";
      vinEnding.textContent = "Please check all 17 characters and try again.";
      vehicleDetails.replaceChildren();
      renderEmpty(recallContent, "No recall results loaded.");
      renderEmpty(safetyContent, "No safety results loaded.");
      renderEmpty(fuelContent, "No fuel-economy results loaded.");
      resultStatus.className = "status-banner error";
      resultStatus.textContent = "The official vehicle service did not return a usable match. Please verify the VIN.";
      setVinMessage("No vehicle match was returned. Please recheck the VIN.", "error");
      track("vin_decoder_error");
    } finally {
      decodeButton.disabled = false;
      decodeButton.textContent = "Decode my VIN";
    }
  }

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (window.__tesseractPromise) return window.__tesseractPromise;
    window.__tesseractPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/auto-center/free-vin-decoder-assets/ocr/tesseract.min.js";
      script.async = true;
      script.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error("Photo reader unavailable")));
      script.onerror = () => {
        window.__tesseractPromise = null;
        reject(new Error("Photo reader failed to load"));
      };
      document.head.append(script);
    });
    return window.__tesseractPromise;
  }

  async function stopOcr() {
    const worker = activeOcrWorker;
    activeOcrWorker = null;
    ocrJob += 1;
    ocrOverlay.hidden = true;
    vinPhoto.value = "";
    platePhoto.value = "";
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // The worker may already be stopping.
      }
    }
    (ocrReturnFocus || scanVinButton).focus();
  }

  function findVinInText(rawText) {
    const normalized = String(rawText || "").toUpperCase().replace(/[IOQ]/g, " ");
    const tokens = normalized.match(/[A-HJ-NPR-Z0-9]{17}/g) || [];
    const compact = normalized.replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (compact.length === 17) tokens.unshift(compact);
    return tokens.find((candidate) => validateVin(candidate).valid) || tokens[0] || "";
  }

  function findPlateInText(rawText) {
    const excluded = new Set(["NORTH", "CAROLINA", "STATE", "DRIVE", "TEMP", "TEMPORARY", "FIRST", "FLIGHT"]);
    const candidates = String(rawText || "")
      .toUpperCase()
      .split(/\s+/)
      .map((part) => part.replace(/[^A-Z0-9]/g, ""))
      .filter((part) => part.length >= 3 && part.length <= 10 && !excluded.has(part));
    candidates.sort((a, b) => {
      const aScore = (/[A-Z]/.test(a) ? 2 : 0) + (/\d/.test(a) ? 2 : 0) + Math.min(a.length, 8) / 10;
      const bScore = (/[A-Z]/.test(b) ? 2 : 0) + (/\d/.test(b) ? 2 : 0) + Math.min(b.length, 8) / 10;
      return bScore - aScore;
    });
    return candidates[0] || "";
  }

  async function runOcr(file, mode) {
    if (!file) return;
    const messageTarget = mode === "vin" ? vinMessage : plateMessage;
    if (!file.type.startsWith("image/")) {
      messageTarget.textContent = "Choose a photo from your camera or photo library.";
      messageTarget.className = "field-message error";
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      messageTarget.textContent = "That photo is larger than 15 MB. Please use a smaller image.";
      messageTarget.className = "field-message error";
      return;
    }
    const job = ++ocrJob;
    let worker = null;
    let nextFocus = mode === "vin" ? scanVinButton : scanPlateButton;
    ocrReturnFocus = nextFocus;
    ocrOverlay.hidden = false;
    ocrProgress.textContent = "Loading the private photo reader. This can take a moment the first time.";
    requestAnimationFrame(() => ocrCancel.focus());
    track(mode === "vin" ? "vin_photo_reader_started" : "plate_photo_reader_started");
    try {
      const Tesseract = await loadTesseract();
      if (job !== ocrJob) return;
      worker = await Tesseract.createWorker("eng", 1, {
        workerPath: "/auto-center/free-vin-decoder-assets/ocr/worker.min.js",
        corePath: "/auto-center/free-vin-decoder-assets/ocr/core",
        langPath: "/auto-center/free-vin-decoder-assets/ocr",
        workerBlobURL: false,
        logger: (status) => {
          if (job !== ocrJob) return;
          const progress = Number.isFinite(status.progress) ? ` ${Math.round(status.progress * 100)}%` : "";
          ocrProgress.textContent = `${status.status || "Reading photo"}${progress}`;
        },
      });
      if (job !== ocrJob) {
        await worker.terminate();
        worker = null;
        return;
      }
      activeOcrWorker = worker;
      const result = await worker.recognize(file);
      if (job !== ocrJob) return;
      if (mode === "vin") {
        const vin = findVinInText(result?.data?.text);
        if (!vin) throw new Error("No 17-character VIN was found");
        vinInput.value = vin;
        vinCount.textContent = `${vin.length}/17`;
        const validation = validateVin(vin);
        setVinMessage(
          validation.valid
            ? "VIN found. Confirm all 17 characters, then select Decode my VIN."
            : "Possible VIN found. Please correct the highlighted characters before decoding.",
          validation.valid ? "success" : "error",
        );
        nextFocus = vinInput;
      } else {
        const plate = findPlateInText(result?.data?.text);
        if (!plate) throw new Error("No plate characters were found");
        lastPlate = plate;
        plateText.textContent = plate;
        plateResult.hidden = false;
        plateMessage.textContent = "Confirm the characters. The button will copy them before opening NHTSA.";
        plateMessage.className = "field-message success";
        nextFocus = plateHandoff;
      }
      track(mode === "vin" ? "vin_photo_reader_completed" : "plate_photo_reader_completed");
    } catch (error) {
      if (job !== ocrJob) return;
      messageTarget.textContent =
        mode === "vin"
          ? "We could not read a VIN from that photo. Try a closer, brighter photo or type it instead."
          : "We could not read the plate. Try a straight, well-lit photo or use NHTSA's checker directly.";
      messageTarget.className = "field-message error";
      track(mode === "vin" ? "vin_photo_reader_error" : "plate_photo_reader_error");
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // A user-initiated cancel may have already stopped it.
        }
      }
      if (activeOcrWorker === worker) activeOcrWorker = null;
      if (job === ocrJob) {
        ocrOverlay.hidden = true;
        vinPhoto.value = "";
        platePhoto.value = "";
        nextFocus.focus();
      }
    }
  }

  function resetTool() {
    activeController?.abort();
    activeController = null;
    activeOcrWorker?.terminate().catch(() => {});
    activeOcrWorker = null;
    ocrJob += 1;
    ocrOverlay.hidden = true;
    vinForm.reset();
    vinInput.value = "";
    vinCount.textContent = "0/17";
    setVinMessage("");
    plateResult.hidden = true;
    plateText.textContent = "";
    plateMessage.textContent = "";
    plateMessage.className = "field-message";
    lastPlate = "";
    currentVin = "";
    ocrReturnFocus = null;
    resultsSection.hidden = true;
    vehicleDetails.replaceChildren();
    resultStatus.textContent = "";
    resultStatus.className = "status-banner";
    decodeWarning.hidden = true;
    exactRecallLink.href = "https://www.nhtsa.gov/recalls";
    setMode("vin");
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("vin_decoder_reset");
  }

  vinInput.addEventListener("input", () => {
    const normalized = normalizeVin(vinInput.value);
    vinInput.value = normalized;
    vinCount.textContent = `${normalized.length}/17`;
    if (!normalized) setVinMessage("");
    else if (normalized.length < 17) setVinMessage(`${17 - normalized.length} character${17 - normalized.length === 1 ? "" : "s"} remaining.`);
    else {
      const validation = validateVin(normalized);
      setVinMessage(validation.message, validation.valid ? "success" : "error");
    }
  });
  vinForm.addEventListener("submit", handleDecode);
  vinTab.addEventListener("click", () => setMode("vin"));
  plateTab.addEventListener("click", () => setMode("plate"));
  [vinTab, plateTab].forEach((tab) => {
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      setMode(tab === vinTab ? "plate" : "vin");
    });
  });
  scanVinButton.addEventListener("click", () => vinPhoto.click());
  scanPlateButton.addEventListener("click", () => platePhoto.click());
  vinPhoto.addEventListener("change", () => runOcr(vinPhoto.files?.[0], "vin"));
  platePhoto.addEventListener("change", () => runOcr(platePhoto.files?.[0], "plate"));
  ocrCancel.addEventListener("click", () => stopOcr());
  ocrOverlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      stopOcr();
    } else if (event.key === "Tab") {
      event.preventDefault();
      ocrCancel.focus();
    }
  });
  plateHandoff.addEventListener("click", async () => {
    if (lastPlate && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(lastPlate);
        plateMessage.textContent = "Plate copied. Paste it into NHTSA and select the state.";
        plateMessage.className = "field-message success";
      } catch {
        plateMessage.textContent = "Copy the plate shown above, then enter it on NHTSA with the state.";
      }
    }
    track("plate_recall_handoff");
  });
  exactRecallLink.addEventListener("click", async () => {
    if (currentVin && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentVin);
        resultStatus.textContent = "VIN copied. Paste it into NHTSA's official checker for the exact result.";
      } catch {
        resultStatus.textContent = "Copy the VIN from the lookup box, then paste it into NHTSA's official checker.";
      }
    }
    track("exact_vin_recall_handoff");
  });
  resetButton.addEventListener("click", resetTool);
})();

(() => {
  const CONFIG = {
    linkName: "LINK-REC-QUAD9",
    degradedLatencyMs: 100,
    degradedLossPercent: 5,
  };

  const root = context.element;
  const frames =
    context?.panelData?.series ||
    context?.panel?.data?.series ||
    [];

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getFieldName = (field) =>
    normalize(
      field?.state?.displayName ||
      field?.config?.displayName ||
      field?.name ||
      ""
    );

  const getValues = (field) => {
    let values = field?.values;

    if (!values) return [];
    if (values.buffer) values = values.buffer;
    if (Array.isArray(values)) return values;
    if (typeof values.toArray === "function") return values.toArray();

    const result = [];
    const length = values.length ?? 0;

    for (let index = 0; index < length; index += 1) {
      result.push(
        typeof values.get === "function"
          ? values.get(index)
          : values[index]
      );
    }

    return result;
  };

  const toNumber = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const text = String(value ?? "").trim();
    if (!text) return null;

    const parsed = Number.parseFloat(
      text.replace(",", ".").replace(/[^0-9+.-]/g, "")
    );

    return Number.isFinite(parsed) ? parsed : null;
  };

  const fields = frames.flatMap((frame) =>
    (frame?.fields || []).map((field) => ({
      field,
      refId: frame.refId,
    }))
  );

  const findField = (...names) => {
    const wantedNames = names.map(normalize);

    return fields.find(({ field }) => {
      const currentName = getFieldName(field);
      return wantedNames.some((wanted) => currentName.includes(wanted));
    })?.field;
  };

  const latest = (field) => {
    const values = getValues(field);

    for (let index = values.length - 1; index >= 0; index -= 1) {
      const value = toNumber(values[index]);
      if (value !== null) return value;
    }

    return null;
  };

  const availability = latest(findField("disponibilidade"));
  const latency = latest(findField("latência", "latencia"));
  const loss = latest(findField("perda de pacote", "perda"));
  const rx = latest(findField("tráfego rx", "trafego rx"));
  const tx = latest(findField("tráfego tx", "trafego tx"));

  const hasData = [availability, latency, loss, rx, tx].some(
    (value) => value !== null
  );

  const online = availability !== null ? availability >= 0.5 : hasData;

  const degraded =
    online &&
    ((loss !== null && loss >= CONFIG.degradedLossPercent) ||
      (latency !== null && latency >= CONFIG.degradedLatencyMs));

  const state = !online
    ? "offline"
    : degraded
      ? "degraded"
      : "online";

  const formatNumber = (value, digits = 1) => {
    if (value === null || !Number.isFinite(value)) return "—";
    return Number(value).toFixed(digits);
  };

  /*
   * O Zabbix/Grafana fornece tráfego em bytes por segundo.
   * A multiplicação por 8 converte o valor para bits por segundo.
   */
  const formatTraffic = (bytesPerSecond) => {
    if (bytesPerSecond === null || !Number.isFinite(bytesPerSecond)) {
      return "—";
    }

    if (bytesPerSecond <= 0) return "0 bps";

    const bitsPerSecond = bytesPerSecond * 8;
    const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
    const unitIndex = Math.min(
      Math.floor(Math.log(bitsPerSecond) / Math.log(1000)),
      units.length - 1
    );
    const formattedValue = bitsPerSecond / Math.pow(1000, unitIndex);

    return `${formattedValue.toFixed(1)} ${units[unitIndex]}`;
  };

  const setText = (selector, value) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  };

  const card = root.querySelector("#noc-card");
  if (!card) return;

  card.dataset.state = state;
  setText("#noc-link-name", CONFIG.linkName);

  setText(
    "#noc-status",
    state === "online"
      ? "ONLINE"
      : state === "degraded"
        ? "DEGRADADO"
        : "OFFLINE"
  );

  setText(
    "#noc-latency",
    latency === null ? "—" : `${formatNumber(latency)} ms`
  );

  setText(
    "#noc-loss",
    loss === null ? "—" : `${formatNumber(loss)}%`
  );

  setText("#noc-rx", formatTraffic(rx));
  setText("#noc-tx", formatTraffic(tx));

  setText(
    "#noc-message",
    state === "online"
      ? "LINK OPERANDO NORMALMENTE"
      : state === "degraded"
        ? "VERIFICAR QUALIDADE"
        : hasData
          ? "LINK INDISPONÍVEL"
          : "SEM DADOS"
  );
})();

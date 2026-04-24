const DEFAULT_PRIMARY_COLOR = "#1948be";

export function normalizePrimaryColor(value) {
    const normalized = String(value || "").trim();

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
        if (normalized.length === 4) {
            return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`.toLowerCase();
        }

        return normalized.toLowerCase();
    }

    return DEFAULT_PRIMARY_COLOR;
}

export function parseThemeSettings(rawValue) {
    if (!rawValue) {
        return {
            primaryColor: DEFAULT_PRIMARY_COLOR,
        };
    }

    try {
        const parsed = JSON.parse(rawValue);

        if (typeof parsed === "string") {
            return {
                primaryColor: normalizePrimaryColor(parsed),
            };
        }

        return {
            primaryColor: normalizePrimaryColor(parsed?.primaryColor),
        };
    } catch {
        return {
            primaryColor: normalizePrimaryColor(rawValue),
        };
    }
}

export function parseThemePayload(payload) {
    return parseThemeSettings(payload?.gia_tri);
}

export function hexToRgbString(value) {
    const color = normalizePrimaryColor(value).replace("#", "");

    return [
        Number.parseInt(color.slice(0, 2), 16),
        Number.parseInt(color.slice(2, 4), 16),
        Number.parseInt(color.slice(4, 6), 16),
    ].join(", ");
}

export function alphaColor(value, alpha) {
    return `rgba(${hexToRgbString(value)}, ${alpha})`;
}

export function parseMediaConfig(rawValue) {
    if (!rawValue) {
        return {
            duongDan: "",
            url: "",
            zoom: 1,
        };
    }

    try {
        const parsed = JSON.parse(rawValue);

        if (typeof parsed === "string") {
            return {
                duongDan: parsed,
                url: parsed,
                zoom: 1,
            };
        }

        const duongDan =
            parsed?.duongDan
            || parsed?.duong_dan
            || parsed?.url
            || "";

        return {
            duongDan,
            url: parsed?.url || duongDan,
            zoom: Number(parsed?.zoom) || 1,
        };
    } catch {
        return {
            duongDan: rawValue,
            url: rawValue,
            zoom: 1,
        };
    }
}

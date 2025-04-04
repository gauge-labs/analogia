import type { CodeDiffRequest } from "@analogia/models/code";
import { StyleChangeType, type StyleChange } from "@analogia/models/style";
import { twMerge } from "tailwind-merge";
import {
  CssToTailwindTranslator,
  propertyMap,
} from "/common/helpers/twTranslator";

export async function getOrCreateCodeDiffRequest(
  oid: string,
  oidToCodeChange: Map<string, CodeDiffRequest>,
): Promise<CodeDiffRequest> {
  let diffRequest = oidToCodeChange.get(oid);
  if (!diffRequest) {
    diffRequest = {
      oid,
      structureChanges: [],
      attributes: {},
      textContent: null,
      overrideClasses: null,
    };
    oidToCodeChange.set(oid, diffRequest);
  }
  return diffRequest;
}

export function addTailwindToRequest(
  request: CodeDiffRequest,
  styles: Record<string, StyleChange>,
): void {
  const newClasses = getTailwindClasses(request.oid, styles);
  request.attributes["className"] = twMerge(
    request.attributes["className"] || "",
    newClasses,
  );
}

export function getTailwindClasses(
  oid: string,
  styles: Record<string, StyleChange>,
): string[] {
  const customColors = Object.entries(styles).reduce(
    (acc, [key, style]) => {
      if (style.type === StyleChangeType.Custom) {
        acc[key] = style;
      }
      return acc;
    },
    {} as Record<string, StyleChange>,
  );
  const normalColors = Object.entries(styles).reduce(
    (acc, [key, style]) => {
      if (style.type !== StyleChangeType.Custom) {
        acc[key] = style;
      }
      return acc;
    },
    {} as Record<string, StyleChange>,
  );

  const css = createCSSRuleString(oid, normalColors);
  const tw = CssToTailwindTranslator(css);
  const twClasses = tw.data.map((res) => res.resultVal);

  const customClasses = Object.entries(customColors)
    .map(([key, style]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      const css = propertyMap.get(cssKey.trim());
      if (typeof css === "function") {
        return css(style.value, true);
      }
    })
    .filter((v) => v !== undefined);

  return [...twClasses, ...customClasses];
}

export function createCSSRuleString(
  oid: string,
  styles: Record<string, StyleChange>,
) {
  const cssString = Object.entries(styles)
    .map(
      ([property, value]) =>
        `${property.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value.value.trim()};`,
    )
    .join(" ");
  return `${oid} { ${cssString} }`;
}

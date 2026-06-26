import type { AttributionResult, AttributionTouchpoint, ConversionSyncRecord } from "../types";

export type AttributionModel = "last-click" | "first-click" | "linear";

function allocateLinear(
  conversion: ConversionSyncRecord,
  touchpoints: AttributionTouchpoint[],
): AttributionResult["allocated"] {
  if (touchpoints.length === 0) {
    return [];
  }

  const each = conversion.value / touchpoints.length;
  return touchpoints.map((tp) => ({
    source: tp.source,
    medium: tp.medium,
    campaignId: tp.campaignId,
    campaignName: tp.campaignName,
    creditValue: each,
  }));
}

export class AttributionEngine {
  run(params: {
    conversions: ConversionSyncRecord[];
    touchpoints: AttributionTouchpoint[];
    model: AttributionModel;
  }): AttributionResult[] {
    const { conversions, touchpoints, model } = params;

    return conversions.map((conversion) => {
      const chain = touchpoints.filter((tp) => tp.conversionId === conversion.id);

      if (chain.length === 0) {
        return {
          conversionId: conversion.id,
          model,
          totalValue: conversion.value,
          allocated: [
            {
              source: conversion.source,
              medium: conversion.medium,
              campaignId: conversion.campaignId,
              campaignName: conversion.campaignName,
              creditValue: conversion.value,
            },
          ],
        };
      }

      if (model === "first-click") {
        const first = chain[0];
        return {
          conversionId: conversion.id,
          model,
          totalValue: conversion.value,
          allocated: [
            {
              source: first.source,
              medium: first.medium,
              campaignId: first.campaignId,
              campaignName: first.campaignName,
              creditValue: conversion.value,
            },
          ],
        };
      }

      if (model === "last-click") {
        const last = chain[chain.length - 1];
        return {
          conversionId: conversion.id,
          model,
          totalValue: conversion.value,
          allocated: [
            {
              source: last.source,
              medium: last.medium,
              campaignId: last.campaignId,
              campaignName: last.campaignName,
              creditValue: conversion.value,
            },
          ],
        };
      }

      return {
        conversionId: conversion.id,
        model,
        totalValue: conversion.value,
        allocated: allocateLinear(conversion, chain),
      };
    });
  }
}

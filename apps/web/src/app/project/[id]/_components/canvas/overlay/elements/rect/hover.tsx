import type { RectDimensions } from "@/components/store/editor/engine/overlay/rect";
import React from "react";
import { BaseRect } from "./base";

interface HoverRectProps {
  rect: RectDimensions | null;
  isComponent?: boolean;
}

export const HoverRect: React.FC<HoverRectProps> = ({ rect, isComponent }) => {
  if (!rect) {
    return null;
  }
  return <BaseRect {...rect} isComponent={isComponent} strokeWidth={1} />;
};

import { SvgXml } from "react-native-svg";

interface IconProps {
  xml: string;
  size?: number;
  width?: number;
  height?: number;
}

// Thin wrapper around react-native-svg's SvgXml for the custom icon set
// in src/theme/svg-icons.ts. Colors are already baked into each SVG
// string (matching decisions.md's palette), not passed as props here.
// `size` is a square shorthand; use `width`/`height` for non-square art.
export function Icon({ xml, size, width, height }: IconProps) {
  return (
    <SvgXml
      xml={xml}
      width={width ?? size ?? 24}
      height={height ?? size ?? 24}
    />
  );
}

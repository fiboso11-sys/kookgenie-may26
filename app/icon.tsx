import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg,#16a34a,#065f46)",
          color: "white",
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "system-ui,sans-serif",
        }}
      >
        K
      </div>
    ),
    { ...size },
  );
}

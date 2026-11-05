import { expect, it } from "vitest";
import { imageDimensions, importLocalImage } from "./localImage";
it("checks binary dimensions and type before any decoder, rejecting SVG, empty and oversized input", async () => {
  expect(() => imageDimensions(new Uint8Array())).toThrow("JPEG ou PNG");
  await expect(
    importLocalImage(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" })),
  ).rejects.toThrow("JPEG ou PNG");
  await expect(
    importLocalImage(new File([], "x.jpg", { type: "image/jpeg" })),
  ).rejects.toThrow("10 MiB");
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 6000);
  view.setUint32(20, 6000);
  expect(imageDimensions(bytes)).toEqual({
    width: 6000,
    height: 6000,
    type: "image/png",
  });
  await expect(
    importLocalImage(new File([bytes], "large.png", { type: "image/png" })),
  ).rejects.toThrow("24 megapixels");
  await expect(
    importLocalImage(new File([bytes], "fake.jpg", { type: "image/jpeg" })),
  ).rejects.toThrow("incompatível");
});

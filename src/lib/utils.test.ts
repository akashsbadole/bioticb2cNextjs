import { describe, it, expect } from "vitest";
import { getGoogleMapsEmbedUrl } from "./utils";

describe("getGoogleMapsEmbedUrl", () => {
  it("should return empty string if input is empty", () => {
    expect(getGoogleMapsEmbedUrl("")).toBe("");
    expect(getGoogleMapsEmbedUrl(null)).toBe("");
    expect(getGoogleMapsEmbedUrl(undefined)).toBe("");
  });

  it("should return the URL as-is if it is already an embed URL", () => {
    const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.18!2d77.12!3d28.64";
    expect(getGoogleMapsEmbedUrl(embedUrl)).toBe(embedUrl);

    const outputEmbedUrl = "https://maps.google.com/maps?q=Udaipur&output=embed";
    expect(getGoogleMapsEmbedUrl(outputEmbedUrl)).toBe(outputEmbedUrl);
  });

  it("should convert a standard Google Maps place URL into an embed URL", () => {
    const placeUrl = "https://www.google.com/maps/place/PurvaBites+Ventures+Pvt.+Ltd/@18.6178949,73.7599339,789m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bc2b9f7f660b473:0x4fb12aefdabbf313!8m2!3d18.6178949!4d73.7599339!16s%2Fg%2F11spmy59z7!5m1!1e1?entry=ttu";
    const expected = "https://maps.google.com/maps?q=PurvaBites%20Ventures%20Pvt.%20Ltd&t=&z=15&ie=UTF8&iwloc=&output=embed";
    expect(getGoogleMapsEmbedUrl(placeUrl)).toBe(expected);
  });

  it("should convert standard Google Maps coordinate-based URL into an embed URL", () => {
    const coordUrl = "https://www.google.com/maps/place/@18.6178949,73.7599339,15z";
    const expected = "https://maps.google.com/maps?q=18.6178949,73.7599339&t=&z=15&ie=UTF8&iwloc=&output=embed";
    expect(getGoogleMapsEmbedUrl(coordUrl)).toBe(expected);
  });

  it("should convert standard Google Maps query-based URL into an embed URL", () => {
    const queryUrl = "https://maps.google.com/maps?q=PurvaBites+Udaipur";
    const expected = "https://maps.google.com/maps?q=PurvaBites%20Udaipur&t=&z=15&ie=UTF8&iwloc=&output=embed";
    expect(getGoogleMapsEmbedUrl(queryUrl)).toBe(expected);
  });

  it("should return the original URL if it is not a Google Maps link", () => {
    const regularUrl = "https://example.com/some/path";
    expect(getGoogleMapsEmbedUrl(regularUrl)).toBe(regularUrl);
  });
});

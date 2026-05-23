import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import {
  loadTags,
  saveTags,
  addTag,
  removeTag,
  getTagsForExpression,
  getExpressionsByTag,
  getAllTags,
} from "./tags";

vi.mock("fs");

const mockStore = {};

beforeEach(() => {
  vi.mocked(fs.existsSync).mockReturnValue(false);
  vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockStore));
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});
  vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
});

describe("loadTags", () => {
  it("returns empty object when file does not exist", () => {
    expect(loadTags()).toEqual({});
  });

  it("parses existing tags file", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ "0 * * * *": ["hourly"] }));
    expect(loadTags()).toEqual({ "0 * * * *": ["hourly"] });
  });
});

describe("addTag", () => {
  it("adds a tag to an expression", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = addTag("0 * * * *", "hourly");
    expect(result["0 * * * *"]).toContain("hourly");
  });

  it("does not duplicate tags", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ "0 * * * *": ["hourly"] }));
    const result = addTag("0 * * * *", "hourly");
    expect(result["0 * * * *"].filter((t) => t === "hourly").length).toBe(1);
  });
});

describe("removeTag", () => {
  it("removes a tag from an expression", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ "0 * * * *": ["hourly", "work"] }));
    const result = removeTag("0 * * * *", "hourly");
    expect(result["0 * * * *"]).not.toContain("hourly");
  });

  it("removes expression key when last tag removed", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ "0 * * * *": ["hourly"] }));
    const result = removeTag("0 * * * *", "hourly");
    expect(result["0 * * * *"]).toBeUndefined();
  });
});

describe("getExpressionsByTag", () => {
  it("returns expressions matching a tag", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ "0 * * * *": ["hourly"], "0 0 * * *": ["daily", "hourly"] })
    );
    const result = getExpressionsByTag("hourly");
    expect(result).toContain("0 * * * *");
    expect(result).toContain("0 0 * * *");
  });
});

describe("getAllTags", () => {
  it("returns sorted unique tags", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ "0 * * * *": ["hourly"], "0 0 * * *": ["daily", "hourly"] })
    );
    expect(getAllTags()).toEqual(["daily", "hourly"]);
  });
});

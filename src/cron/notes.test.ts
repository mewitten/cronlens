import fs from "fs";
import path from "path";
import {
  loadNotes,
  saveNotes,
  setNote,
  removeNote,
  getNote,
  getAllNotes,
} from "./notes";

const NOTES_FILE = path.join(process.env.HOME || ".", ".cronlens", "notes.json");

afterEach(() => {
  if (fs.existsSync(NOTES_FILE)) fs.unlinkSync(NOTES_FILE);
});

describe("loadNotes", () => {
  it("returns empty object when file does not exist", () => {
    expect(loadNotes()).toEqual({});
  });

  it("returns parsed store from file", () => {
    const store = { "* * * * *": { expression: "* * * * *", note: "every min", updatedAt: "2024-01-01T00:00:00.000Z" } };
    saveNotes(store);
    expect(loadNotes()).toEqual(store);
  });
});

describe("setNote", () => {
  it("adds a note for an expression", () => {
    const store = setNote("0 * * * *", "every hour");
    expect(store["0 * * * *"]).toBeDefined();
    expect(store["0 * * * *"].note).toBe("every hour");
    expect(store["0 * * * *"].expression).toBe("0 * * * *");
  });

  it("overwrites existing note", () => {
    setNote("0 * * * *", "first note");
    const store = setNote("0 * * * *", "updated note");
    expect(store["0 * * * *"].note).toBe("updated note");
  });
});

describe("removeNote", () => {
  it("removes an existing note", () => {
    setNote("0 0 * * *", "daily");
    const store = removeNote("0 0 * * *");
    expect(store["0 0 * * *"]).toBeUndefined();
  });

  it("is a no-op for non-existent expression", () => {
    expect(() => removeNote("9 9 9 9 9")).not.toThrow();
  });
});

describe("getNote", () => {
  it("returns note entry for known expression", () => {
    setNote("0 12 * * *", "noon daily");
    const entry = getNote("0 12 * * *");
    expect(entry?.note).toBe("noon daily");
  });

  it("returns undefined for unknown expression", () => {
    expect(getNote("1 2 3 4 5")).toBeUndefined();
  });
});

describe("getAllNotes", () => {
  it("returns all notes sorted by updatedAt descending", () => {
    setNote("0 1 * * *", "note A");
    setNote("0 2 * * *", "note B");
    const notes = getAllNotes();
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes[0].updatedAt >= notes[1].updatedAt).toBe(true);
  });
});

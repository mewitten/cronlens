import React from "react";
import { render } from "ink-testing-library";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagsPanel, TagBadge } from "./TagsPanel";
import * as tags from "../cron/tags";

vi.mock("../cron/tags");

beforeEach(() => {
  vi.mocked(tags.getTagsForExpression).mockReturnValue(["hourly", "work"]);
  vi.mocked(tags.getAllTags).mockReturnValue(["daily", "hourly", "work"]);
  vi.mocked(tags.addTag).mockImplementation((expr, tag) => ({ [expr]: ["hourly", "work", tag] }));
  vi.mocked(tags.removeTag).mockImplementation((expr, tag) => ({
    [expr]: ["hourly", "work"].filter((t) => t !== tag),
  }));
});

describe("TagBadge", () => {
  it("renders tag name in brackets", () => {
    const { lastFrame } = render(<TagBadge tag="hourly" />);
    expect(lastFrame()).toContain("hourly");
  });

  it("renders remove indicator when onRemove provided", () => {
    const { lastFrame } = render(<TagBadge tag="hourly" onRemove={() => {}} />);
    expect(lastFrame()).toContain("×");
  });
});

describe("TagsPanel", () => {
  it("renders expression title", () => {
    const { lastFrame } = render(<TagsPanel expression="0 * * * *" />);
    expect(lastFrame()).toContain("0 * * * *");
  });

  it("renders existing tags", () => {
    const { lastFrame } = render(<TagsPanel expression="0 * * * *" />);
    expect(lastFrame()).toContain("hourly");
    expect(lastFrame()).toContain("work");
  });

  it("shows all tags summary", () => {
    const { lastFrame } = render(<TagsPanel expression="0 * * * *" />);
    expect(lastFrame()).toContain("daily");
  });

  it("shows empty state when no tags", () => {
    vi.mocked(tags.getTagsForExpression).mockReturnValue([]);
    const { lastFrame } = render(<TagsPanel expression="* * * * *" />);
    expect(lastFrame()).toContain("No tags yet");
  });
});

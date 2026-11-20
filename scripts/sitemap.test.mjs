import test from "node:test";
import assert from "node:assert/strict";
import { articleLastModifiedAt, buildSitemapEntries } from "../lib/sitemap-utils.ts";

const row = (slug, published_at, updated_at = null, created_at = "2026-01-01T00:00:00Z") =>
  ({ slug, published_at, updated_at, created_at });
const base = "https://miidasu.co";

test("new article appears above the homepage and blog hub, without fake dates", () => {
  const entries = buildSitemapEntries(base, [
    row("old-story", "2026-11-10T08:00:00Z"),
    row("new-story", "2026-11-20T09:00:00Z"),
  ], ["/", "/blog/", "/privacy/"]);
  assert.equal(entries[0].url, base + "/blog/new-story/");
  assert.equal(entries[1].url, base + "/");
  assert.equal(entries[2].url, base + "/blog/");
  assert.equal(entries.at(-1).url, base + "/privacy/");
  assert.equal(entries.at(-1).lastModified, undefined);
});

test("a real CMS update moves the older article to the top", () => {
  const entries = buildSitemapEntries(base, [
    row("old-but-updated", "2026-10-01T00:00:00Z", "2026-11-20T10:00:00Z"),
    row("more-recently-published", "2026-11-19T09:00:00Z"),
  ], ["/", "/blog/"]);
  assert.equal(entries[0].url, base + "/blog/old-but-updated/");
  assert.equal(entries[0].lastModified.toISOString(), "2026-11-20T10:00:00.000Z");
});

test("an imported row's creation date never masquerades as a content update", () => {
  const actual = articleLastModifiedAt(row("import", "2026-10-01T10:00:00Z", "2026-10-02T10:00:00Z", "2026-11-20T10:00:00Z"));
  assert.equal(actual.toISOString(), "2026-10-02T10:00:00.000Z");
});

test("published date beats an older edit timestamp, and invalid dates are omitted", () => {
  assert.equal(articleLastModifiedAt(row("one", "2026-11-19T10:00:00Z", "2026-10-01T10:00:00Z")).toISOString(), "2026-11-19T10:00:00.000Z");
  const entries = buildSitemapEntries(base, [row("untimed", null, "not a date", null)], ["/"]);
  assert.equal(entries[0].lastModified, undefined);
});

test("duplicate article slugs cannot produce duplicate URLs", () => {
  const entries = buildSitemapEntries(base, [
    row("same", "2026-11-01T00:00:00Z"),
    row("same", "2026-11-19T00:00:00Z"),
  ], ["/", "/blog/"]);
  assert.equal(entries.length, 3);
  assert.equal(entries[0].lastModified.toISOString(), "2026-11-19T00:00:00.000Z");
});

test("large numbers of posts remain ordered and are not silently truncated", () => {
  const articles = Array.from({ length: 1501 }, (_, i) =>
    row("post-" + i, new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString()));
  const entries = buildSitemapEntries(base, articles, ["/"]);
  assert.equal(entries.length, 1502);
  assert.equal(entries[0].url, base + "/blog/post-1500/");
});

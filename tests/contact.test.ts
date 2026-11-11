import { test } from "node:test";
import assert from "node:assert/strict";
import { contact, validateContact, looksLikeBot, composeLinks, LIMITS } from "../src/lib/contact";

const ok = { name: "Sara Ahmed", email: "sara@example.com", subject: "RAP lesson question", message: "A question about lesson 3.", trap: "" };

test("contact details are assembled correctly", () => {
  assert.equal(contact.email, "rashed019r@gmail.com");
  assert.equal(contact.phoneDisplay, "+966 55 290 3225");
  assert.equal(contact.phoneHref, "tel:+966552903225");
});

test("valid message passes; each bad field is reported", () => {
  assert.deepEqual(validateContact(ok), {});
  const errors = validateContact({ name: " ", email: "not-an-email", subject: "", message: "short", trap: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "message", "name", "subject"]);
  assert.ok(validateContact({ ...ok, subject: "x".repeat(LIMITS.subject + 1) }).subject);
  assert.ok(validateContact({ ...ok, name: "x".repeat(LIMITS.name + 1) }).name);
  assert.ok(validateContact({ ...ok, message: "x".repeat(LIMITS.message + 1) }).message);
});

test("more than two links is rejected as link spam", () => {
  assert.deepEqual(validateContact({ ...ok, message: "See https://a.com and www.b.com please" }), {});
  assert.ok(validateContact({ ...ok, message: "http://a.com http://b.com http://c.com" }).message);
});

test("only a filled trap field marks a bot; a fast real person is not one", () => {
  assert.equal(looksLikeBot(ok), false);
  assert.equal(looksLikeBot({ ...ok, trap: "spam.example" }), true);
});

test("compose links prefill Gmail and mailto, and encode user text so it cannot add recipients", () => {
  const { gmail, mailto } = composeLinks({ ...ok, name: "  Sara Ahmed ", trap: "x" });
  const g = new URL(gmail);
  assert.equal(g.origin + g.pathname, "https://mail.google.com/mail/");
  assert.equal(g.searchParams.get("to"), "rashed019r@gmail.com");
  assert.equal(g.searchParams.get("su"), "RAP lesson question");
  assert.equal(g.searchParams.get("body"), "A question about lesson 3.\n\nSara Ahmed\nsara@example.com");
  assert.ok(mailto.startsWith("mailto:rashed019r@gmail.com?subject="));
  const evil = composeLinks({ ...ok, subject: "Hi&cc=w@evil.com", name: "Eve&cc=x@evil.com&to=y@evil.com", message: "Hi\n&bcc=z@evil.com" });
  assert.deepEqual([...new URL(evil.gmail).searchParams.keys()], ["view", "fs", "to", "su", "body"]);
  assert.equal(new URL(evil.gmail).searchParams.getAll("to").length, 1);
  assert.equal(evil.mailto.split("&").length, 2, "only subject and body parameters");
});

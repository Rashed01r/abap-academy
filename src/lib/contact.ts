// Contact page data and rules. No server: Send opens a prefilled Gmail draft that the visitor sends.
// The address is stored in parts so that bots scanning the JS bundle for email patterns do not match it.
const address = ["rashed019r", "gmail.com"];
const phone = ["966", "55", "290", "3225"];

export const contact = {
  email: address.join("@"),
  phoneDisplay: `+${phone[0]} ${phone.slice(1).join(" ")}`, // +966 55 290 3225
  phoneHref: `tel:+${phone.join("")}`,
  linkedin: "https://www.linkedin.com/in/rashed-balhareth-5385a5240/",
  github: "https://github.com/Rashed01r",
};

export const LIMITS = { name: 80, email: 254, subject: 120, message: 2000, links: 2, cooldownMs: 60_000 };
export type ContactFields = { name: string; email: string; subject: string; message: string; trap: string };
export type ContactErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function validateContact(f: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = f.name.trim(), email = f.email.trim(), subject = f.subject.trim(), message = f.message.trim();
  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > LIMITS.name) errors.name = `Use at most ${LIMITS.name} characters.`;
  if (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email address.";
  if (subject.length < 3) errors.subject = "Please enter a subject.";
  else if (subject.length > LIMITS.subject) errors.subject = `Use at most ${LIMITS.subject} characters.`;
  if (message.length < 10) errors.message = "Please write at least 10 characters.";
  else if (message.length > LIMITS.message) errors.message = `Use at most ${LIMITS.message} characters.`;
  else if ((message.match(/https?:\/\/|www\./gi) || []).length > LIMITS.links) errors.message = `Please include at most ${LIMITS.links} links.`;
  return errors;
}

/** Hidden trap field filled: only bots do that. (No timing check: autofill made real people fail it,
 *  and a bot gains nothing here because a person must still press Send in Gmail.) */
export function looksLikeBot(f: ContactFields) {
  return f.trap !== "";
}

/** Prefilled drafts: Gmail's web compose (opens in a tab) and a mailto: fallback for other email apps.
 *  The visitor reviews the draft and presses Send themselves. */
export function composeLinks(f: ContactFields) {
  const name = f.name.trim();
  const subject = f.subject.trim();
  const body = `${f.message.trim()}\n\n${name}\n${f.email.trim()}`;
  const q = (s: string) => encodeURIComponent(s);
  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${q(contact.email)}&su=${q(subject)}&body=${q(body)}`,
    mailto: `mailto:${contact.email}?subject=${q(subject)}&body=${q(body)}`,
  };
}

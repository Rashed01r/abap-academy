// Contact page mockups: shared behavior for option-a/b/c.html.
// Anti-spam layers (client side): details built at runtime, honeypot, minimum fill time,
// link limit, cooldown and strict length checks. User text is only ever set with textContent.

// 1. Email and phone are not in the HTML source, so simple scraper bots never see them.
const user = ["rashed019r", "gmail.com"], phoneDigits = ["966", "55", "290", "3225"];
const email = user.join("@");
const phoneShown = `+${phoneDigits[0]} ${phoneDigits.slice(1).join(" ")}`; // +966 55 290 3225
const phoneHref = `tel:+${phoneDigits.join("")}`;

for (const el of document.querySelectorAll("[data-email]")) { el.textContent = email; if (el.tagName === "A") el.href = `mailto:${email}`; }
for (const el of document.querySelectorAll("[data-phone]")) { el.textContent = phoneShown; if (el.tagName === "A") el.href = phoneHref; }
for (const el of document.querySelectorAll("[data-phone-local]")) el.textContent = `0${phoneDigits.slice(1).join(" ")}`; // 055 290 3225

const form = document.querySelector("form[data-contact]");
if (form) {
  const loadedAt = Date.now();
  const status = form.querySelector(".status");
  const send = form.querySelector("button.send");
  const msg = form.elements.message, counter = form.querySelector("[data-count]");
  const MAX = { name: 80, email: 254, message: 2000 };
  const COOLDOWN_MS = 60_000;

  const update = () => { if (counter) counter.textContent = `${msg.value.length} / ${MAX.message}`; };
  msg.addEventListener("input", update); update();

  function setError(name, text) {
    const input = form.elements[name], err = form.querySelector(`#${name}-error`);
    input.setAttribute("aria-invalid", text ? "true" : "false");
    err.textContent = text;
    return !text;
  }
  function show(kind, text) { status.className = `status ${kind}`; status.textContent = text; }
  function lastSent() { try { return Number(localStorage.getItem("contact-last-sent")) || 0; } catch { return 0; } }
  function markSent() { try { localStorage.setItem("contact-last-sent", String(Date.now())); } catch { /* storage blocked: cooldown is best effort */ } }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), from = form.elements.email.value.trim(), text = msg.value.trim();

    // 2. Field checks: same limits as the maxlength attributes, re-checked here.
    const ok = [
      setError("name", name.length < 2 ? "Please enter your full name." : name.length > MAX.name ? `Use at most ${MAX.name} characters.` : ""),
      setError("email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(from) || from.length > MAX.email ? "Please enter a valid email address." : ""),
      setError("message", text.length < 10 ? "Please write at least 10 characters." : text.length > MAX.message ? `Use at most ${MAX.message} characters.` : ""),
    ].every(Boolean);
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

    // 3. Honeypot: a person never sees or fills this field. Pretend success so the bot learns nothing.
    // 4. Too fast: people need more than 3 seconds to fill three fields; scripts do not.
    const bot = form.elements.website.value !== "" || Date.now() - loadedAt < 3000;
    // 5. Link spam: real questions rarely need more than two links.
    const links = (text.match(/https?:\/\/|www\./gi) || []).length;
    if (links > 2) return show("bad", "Please include at most two links.");
    // 6. Cooldown: one message per minute from this browser.
    if (Date.now() - lastSent() < COOLDOWN_MS) return show("bad", "You just sent a message. Please wait a minute before sending another.");

    send.disabled = true;
    setTimeout(() => {
      send.disabled = false;
      if (!bot) markSent();
      form.reset(); update();
      // MOCKUP: nothing is sent yet. The real page will deliver this (email app or form service, your choice).
      show("ok", `Thank you${bot ? "" : `, ${name}`}. Your message was sent; I usually reply within 1–2 days.`);
    }, 600);
  });
}

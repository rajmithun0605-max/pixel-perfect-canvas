// LocalStorage-backed capsule store. Ships with a few seed entries on first visit.
const KEY = "chrona:capsules:v1";
const SEED_KEY = "chrona:seeded";

const seed = [
  {
    id: "seed-1",
    title: "First entry",
    body: "If you're reading this, you kept the habit going. Small proud moment. Keep the pen moving — you always feel better afterward.",
    tags: ["reminders", "gratitude"],
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    unsealAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "seed-2",
    title: "Something to open next year",
    body: "Write down what scared you most this month and what you did about it. When you read this back, you'll see how much smaller it looks in hindsight.",
    tags: ["goals"],
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    unsealAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
  },
];

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

if (!localStorage.getItem(SEED_KEY)) {
  write(seed);
  localStorage.setItem(SEED_KEY, "1");
}

export const store = {
  all() {
    return read().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  get(id) {
    return read().find((c) => c.id === id);
  },
  add(capsule) {
    const list = read();
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...capsule };
    list.push(item);
    write(list);
    return item;
  },
  remove(id) {
    write(read().filter((c) => c.id !== id));
  },
  update(id, patch) {
    const list = read();
    const i = list.findIndex((c) => c.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; write(list); return list[i]; }
  },
  import(data) {
    write(data);
  },
  isSealed(capsule) {
    return new Date(capsule.unsealAt) > new Date();
  },
};

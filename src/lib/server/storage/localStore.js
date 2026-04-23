import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const storePath = path.join(process.cwd(), "src", "data", "local-store.json");

const defaultState = {
  users: [],
  officers: [],
  otps: [],
  posts: [],
};

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(defaultState, null, 2));
  }
}

async function readState() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  return { ...defaultState, ...JSON.parse(raw) };
}

async function writeState(state) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(state, null, 2));
}

const now = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));

export async function findUserByEmail(email) {
  const state = await readState();
  return state.users.find((user) => user.email === email) || null;
}

export async function findUserById(id) {
  const state = await readState();
  return state.users.find((user) => user._id === id) || null;
}

export async function createUser(data) {
  const state = await readState();
  const user = {
    _id: randomUUID(),
    email: data.email,
    userName: data.userName,
    password: data.password,
    emailVerified: Boolean(data.emailVerified),
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    createdAt: now(),
    updatedAt: now(),
  };
  state.users.push(user);
  await writeState(state);
  return clone(user);
}

export async function findOfficerByEmail(email) {
  const state = await readState();
  return state.officers.find((officer) => officer.email === email) || null;
}

export async function createOfficer(data) {
  const state = await readState();
  const officer = {
    _id: randomUUID(),
    email: data.email,
    userName: data.userName,
    password: data.password,
    role: "officer",
    createdAt: now(),
    updatedAt: now(),
  };
  state.officers.push(officer);
  await writeState(state);
  return clone(officer);
}

export async function saveOtp(data) {
  const state = await readState();
  const purpose = data.purpose || "signup";
  state.otps = state.otps.filter(
    (otp) => !(otp.email === data.email && otp.purpose === purpose),
  );
  state.otps.push({
    _id: randomUUID(),
    email: data.email,
    otp: data.otp,
    purpose,
    expiresAt: data.expiresAt,
    createdAt: now(),
  });
  await writeState(state);
}

export async function findOtp(email, otp, purpose = "signup") {
  const state = await readState();
  const record =
    state.otps.find(
      (entry) =>
        entry.email === email &&
        entry.otp === otp &&
        (entry.purpose || "signup") === purpose,
    ) || null;

  if (!record) return null;

  if (new Date(record.expiresAt) < new Date()) {
    state.otps = state.otps.filter((entry) => entry._id !== record._id);
    await writeState(state);
    return null;
  }

  return record ? clone(record) : null;
}

export async function deleteOtp(email, otp, purpose = "signup") {
  const state = await readState();
  state.otps = state.otps.filter(
    (entry) =>
      !(
        entry.email === email &&
        entry.otp === otp &&
        (entry.purpose || "signup") === purpose
      ),
  );
  await writeState(state);
}

export async function setUserResetToken(email, token, expiresAt) {
  const state = await readState();
  const userIndex = state.users.findIndex((user) => user.email === email);
  if (userIndex === -1) return false;

  state.users[userIndex] = {
    ...state.users[userIndex],
    passwordResetToken: token,
    passwordResetExpiresAt: expiresAt,
    updatedAt: now(),
  };

  await writeState(state);
  return true;
}

export async function findUserByResetToken(token) {
  const state = await readState();
  const user =
    state.users.find((entry) => entry.passwordResetToken === token) || null;
  if (!user) return null;

  if (
    !user.passwordResetExpiresAt ||
    new Date(user.passwordResetExpiresAt) < new Date()
  ) {
    return null;
  }

  return clone(user);
}

export async function resetUserPasswordById(id, hashedPassword) {
  const state = await readState();
  const userIndex = state.users.findIndex((user) => user._id === id);
  if (userIndex === -1) return null;

  state.users[userIndex] = {
    ...state.users[userIndex],
    password: hashedPassword,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    updatedAt: now(),
  };

  await writeState(state);
  return clone(state.users[userIndex]);
}

export async function createPost(data) {
  const state = await readState();
  const post = {
    _id: randomUUID(),
    title: data.title,
    description: data.description,
    department: data.department,
    category: data.category || data.department || "Other",
    status: data.status || "Pending",
    location: data.location,
    priority: data.priority || "Low",
    imageUrl: data.imageUrl || "",
    videoUrl: data.videoUrl || "",
    likesCount: data.likesCount || 0,
    likes: data.likes || [],
    createdUser: data.createdUser,
    comments: data.comments || [],
    commentsCount: data.commentsCount || 0,
    views: data.views || 0,
    createdAt: now(),
    updatedAt: now(),
  };
  state.posts.push(post);
  await writeState(state);
  return clone(post);
}

export async function listPosts() {
  const state = await readState();
  return clone(state.posts).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function findPostById(id) {
  const state = await readState();
  const post = state.posts.find((entry) => entry._id === id) || null;
  return post ? clone(post) : null;
}

export async function updatePostById(id, updater) {
  const state = await readState();
  const index = state.posts.findIndex((entry) => entry._id === id);
  if (index === -1) return null;

  const updated = updater(clone(state.posts[index]));
  state.posts[index] = {
    ...updated,
    updatedAt: now(),
  };
  await writeState(state);
  return clone(state.posts[index]);
}

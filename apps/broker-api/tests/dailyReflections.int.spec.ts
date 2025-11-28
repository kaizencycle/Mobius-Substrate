// C-148 • Strange Metamorphosis Loop – Integration Tests

import request from "supertest";
import express from "express";
import { Pool } from "pg";
import dailyReflectionsRouter from "../src/routes/v1/dailyReflections";

// Mock the database pool for testing
jest.mock("pg", () => {
  const mockPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

const app = express();
app.use(express.json());
app.use("/", dailyReflectionsRouter);

describe("Daily Reflections API", () => {
  let mockPool: any;

  beforeAll(() => {
    const { Pool } = require("pg");
    mockPool = new Pool();
  });

  afterAll(async () => {
    if (mockPool.end) {
      await mockPool.end();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const basePath = "/v1/reflections/daily";

  it("rejects missing user_id or date", async () => {
    const res = await request(app).post(basePath).send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("creates a daily reflection", async () => {
    const mockReflection = {
      id: "test-id-123",
      user_id: "test_user",
      reflection_date: "2025-11-28",
      worldview_text: "The world feels fragile but hopeful.",
      mood_label: "tired_but_grateful",
      mood_intensity: 0.7,
      intent_text: "Ship SML PR and rest.",
      intent_category: "personal_growth",
      echo_score: 0.97,
      gi_score: 0.95,
      echo_review_status: "verified",
      metadata: { source: "test" },
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPool.query.mockResolvedValueOnce({
      rows: [mockReflection],
      rowCount: 1,
    });

    const payload = {
      user_id: "test_user",
      date: "2025-11-28",
      worldview_text: "The world feels fragile but hopeful.",
      mood_label: "tired_but_grateful",
      mood_intensity: 0.7,
      intent_text: "Ship SML PR and rest.",
      intent_category: "personal_growth",
      metadata: { source: "test" },
    };

    const res = await request(app).post(basePath).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.userId || res.body.user_id).toBeDefined();
    expect(res.body.echoScore || res.body.echo_score).toBeDefined();
    expect(res.body.giScore || res.body.gi_score).toBeDefined();
  });

  it("upserts on same user+date", async () => {
    const firstReflection = {
      id: "test-id-123",
      user_id: "test_user_2",
      reflection_date: "2025-11-28",
      worldview_text: "First reflection.",
      echo_score: 0.97,
      gi_score: 0.95,
      echo_review_status: "verified",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedReflection = {
      ...firstReflection,
      worldview_text: "Updated reflection.",
    };

    mockPool.query
      .mockResolvedValueOnce({
        rows: [firstReflection],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [updatedReflection],
        rowCount: 1,
      });

    const payload1 = {
      user_id: "test_user_2",
      date: "2025-11-28",
      worldview_text: "First reflection.",
    };

    const payload2 = {
      user_id: "test_user_2",
      date: "2025-11-28",
      worldview_text: "Updated reflection.",
    };

    const res1 = await request(app).post(basePath).send(payload1);
    expect(res1.status).toBe(200);
    const firstId = res1.body.id;

    const res2 = await request(app).post(basePath).send(payload2);
    expect(res2.status).toBe(200);
    const secondId = res2.body.id;

    // same record, updated
    expect(firstId).toBe(secondId);
    expect(
      res2.body.worldviewText || res2.body.worldview_text
    ).toContain("Updated");
  });

  it("fetches existing reflection by user and date", async () => {
    const userId = "test_user_3";
    const date = "2025-11-28";

    const mockReflection = {
      id: "test-id-456",
      user_id: userId,
      reflection_date: date,
      worldview_text: "Stored reflection.",
      echo_score: 0.97,
      gi_score: 0.95,
      echo_review_status: "verified",
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPool.query.mockResolvedValueOnce({
      rows: [mockReflection],
      rowCount: 1,
    });

    await request(app).post(basePath).send({
      user_id: userId,
      date,
      worldview_text: "Stored reflection.",
    });

    mockPool.query.mockResolvedValueOnce({
      rows: [mockReflection],
      rowCount: 1,
    });

    const res = await request(app)
      .get(`${basePath}/${userId}`)
      .query({ date });

    expect(res.status).toBe(200);
    expect(
      res.body.worldviewText || res.body.worldview_text
    ).toContain("Stored reflection.");
  });

  it("returns 404 if reflection not found", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const res = await request(app)
      .get(`${basePath}/nonexistent_user`)
      .query({ date: "2025-11-28" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });
});

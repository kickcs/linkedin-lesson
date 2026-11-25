import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPost, hookOf } from "../skills/linkedin-lesson/recipe/bin/postcheck.mjs";

const P1 = "A lot of problems come from edge cases and outages. We often don't plan for them at design time.";
const P2 = "Take a money transfer. If the service crashes after saving it, the bank never gets the request.";
const P3 = "To solve this, we can use a transactional outbox. A worker carries the note to the bank.";
const GOOD = [P1, P2, P3].join("\n\n");

test("a good post passes", () => assert.deepEqual(checkPost(GOOD), []));
test("three hashtags on the last line are fine", () => assert.deepEqual(checkPost(GOOD + "\n\n#ai #backend #outbox"), []));
test("hashtags right under the paragraph are also the last line", () => assert.deepEqual(checkPost(GOOD + "\n#ai #backend"), []));
test("a line break inside a paragraph does not split it", () => assert.deepEqual(checkPost(GOOD.replace("outages. We", "outages.\nWe")), []));
test("the hook is the first sentence", () => assert.equal(hookOf(P1), "A lot of problems come from edge cases and outages."));
test("a hook with a series label includes the label", () =>
  assert.equal(hookOf("Day 2/30 of explaining AI. Models guess. More text."), "Day 2/30 of explaining AI. Models guess."));
test("hook longer than 80", () => assert.match(checkPost(GOOD.replace(P1, "x".repeat(81) + ". Rest.")).join(), /hook 82/));
test("hook with a series label longer than 80", () =>
  assert.match(checkPost(GOOD.replace(P1, "Day 2/30 of explaining AI. " + "x".repeat(60) + ". Rest.")).join(), /hook \d+ characters/));
test("post longer than 700", () => assert.match(checkPost(GOOD.replace(P2, "b".repeat(600) + ".")).join(), /post \d+ characters/));
test("two paragraphs", () => assert.match(checkPost([P1, P2].join("\n\n")).join(), /2 paragraphs/));
test("four paragraphs", () => assert.match(checkPost([P1, P2, P3, P3].join("\n\n")).join(), /4 paragraphs/));
test("lines without blank lines are one paragraph", () => assert.match(checkPost([P1, P2, P3].join("\n")).join(), /1 paragraphs/));
test("emoji", () => assert.match(checkPost(GOOD + " 🚀").join(), /emoji/));
test("a question in the hook is fine", () => assert.deepEqual(checkPost(GOOD.replace("outages.", "outages?")), []));
test("a quoted question in the hook is fine", () =>
  assert.deepEqual(checkPost(GOOD.replace("A lot of problems come from edge cases and outages.", "“Where did the $100 go?” Rest.")), []));
test("a question in the second sentence is an error", () => assert.match(checkPost(GOOD.replace("design time.", "design time?")).join(), /question/));
test("a question in the last paragraph is an error", () => assert.match(checkPost(GOOD.replace("the bank.", "the bank?")).join(), /question/));
test("link", () => assert.match(checkPost(GOOD + " https://x.dev").join(), /link/));
test("four hashtags", () => assert.match(checkPost(GOOD + "\n\n#ai #claude #agents #dev").join(), /4 hashtags/));
test("hashtag in the text", () => assert.match(checkPost(GOOD.replace("a worker", "a #worker").replace("A worker", "A #worker")).join(), /last line/));
test("C# is not a hashtag", () => assert.deepEqual(checkPost(GOOD.replace("Take a money", "Take a C# money")), []));

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPost, hookOf } from "../skills/linkedin-lesson/recipe/bin/postcheck.mjs";
import { bold } from "../skills/linkedin-lesson/recipe/bin/bold.mjs";

const P1 = "A lot of problems come from edge cases and outages. We often don't plan for them at design time.";
const P2 = bold("Take a money transfer. If the service crashes after saving it, **the bank never gets the request**.");
const P3 = bold("To solve this, we can use a **transactional outbox**. A worker carries the note to the bank.");
const GOOD = [P1, P2, P3].join("\n\n");

test("a good post passes", () => assert.deepEqual(checkPost(GOOD), []));
test("the skill's model post passes", () =>
  assert.deepEqual(checkPost(readFileSync(new URL("../skills/linkedin-lesson/examples/outbox/post.txt", import.meta.url), "utf8")), []));
test("the series hashtag on the last line is fine", () => assert.deepEqual(checkPost(GOOD + "\n\n#30DaysOfAI"), []));
test("a hashtag right under the paragraph is also the last line", () => assert.deepEqual(checkPost(GOOD + "\n#30DaysOfAI"), []));
test("a line break inside a paragraph does not split it", () => assert.deepEqual(checkPost(GOOD.replace("outages. We", "outages.\nWe")), []));
test("the hook is the first sentence", () => assert.equal(hookOf(P1), "A lot of problems come from edge cases and outages."));
test("a hook with a series label includes the label", () =>
  assert.equal(hookOf("Day 2/30 of explaining AI. Models guess. More text."), "Day 2/30 of explaining AI. Models guess."));
test("hook longer than 80", () => assert.match(checkPost(GOOD.replace(P1, "x".repeat(81) + ". Rest.")).join(), /hook 82/));
test("hook with a series label longer than 80", () =>
  assert.match(checkPost(GOOD.replace(P1, "Day 2/30 of explaining AI. " + "x".repeat(60) + ". Rest.")).join(), /hook \d+ characters/));
test("post longer than 450", () => assert.match(checkPost(GOOD.replace(P1, "A hook. " + "b".repeat(300) + ".")).join(), /post 4\d\d characters, max 450/));
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
test("two hashtags", () => assert.match(checkPost(GOOD + "\n\n#ai #backend").join(), /2 hashtags, max 1/));
test("hashtag in the text", () => assert.match(checkPost(GOOD.replace("A worker", "A #worker")).join(), /last line/));
test("C# is not a hashtag", () => assert.deepEqual(checkPost(GOOD.replace("Take a money", "Take a C# money")), []));
test("no bold phrase is an error", () =>
  assert.match(checkPost([P1, "Take a money transfer.", "To solve this, we can use an outbox."].join("\n\n")).join(), /0 bold phrases/));
test("one bold phrase is an error", () => assert.match(checkPost(GOOD.replace(P3, "To solve this, we can use an outbox.")).join(), /1 bold phrases/));
test("four bold phrases are an error", () =>
  assert.match(checkPost(GOOD.replace(P1, bold("A lot of **problems** come from **outages**. Rest."))).join(), /4 bold phrases/));
test("bold words joined by quotes and spaces are one phrase", () =>
  assert.deepEqual(checkPost(GOOD.replace("to the bank.", bold("to the bank, and Ben gets “**accepted**” **at once**."))), []));
test("** marks left in the file are an error", () => assert.match(checkPost(GOOD.replace("A worker", "A **worker**")).join(), /\*\* marks left/));
test("bold turns letters and digits into sans-serif bold and keeps the rest", () => {
  assert.equal(bold("and **Anna gets $0**."), "and 𝗔𝗻𝗻𝗮 𝗴𝗲𝘁𝘀 $𝟬.");
  assert.equal(bold("“**accepted**” at once"), "“𝗮𝗰𝗰𝗲𝗽𝘁𝗲𝗱” at once");
  assert.equal(bold("no marks here"), "no marks here");
});

const { test } = require("node:test");
const assert = require("node:assert");
const { WIZARD_STEPS } = require("../lib/project-wizard-steps");

test("WIZARD_STEPS is a non-empty array", () => {
  assert.ok(Array.isArray(WIZARD_STEPS));
  assert.ok(WIZARD_STEPS.length > 0);
});

test("every step has id, title, description and fields", () => {
  for (const step of WIZARD_STEPS) {
    assert.ok(typeof step.id === "string" && step.id.length > 0, `step.id missing: ${step.id}`);
    assert.ok(typeof step.title === "string" && step.title.length > 0, "step.title missing");
    assert.ok(typeof step.description === "string", "step.description missing");
    assert.ok(Array.isArray(step.fields), "step.fields must be an array");
  }
});

test("every field has a name and supported type", () => {
  const supported = ["text", "textarea", "select", "checkbox-group"];
  for (const step of WIZARD_STEPS) {
    for (const field of step.fields) {
      assert.ok(typeof field.name === "string" && field.name.length > 0, "field.name missing");
      assert.ok(supported.includes(field.type), `unsupported field type: ${field.type}`);
    }
  }
});

test("select and checkbox-group fields declare options", () => {
  for (const step of WIZARD_STEPS) {
    for (const field of step.fields) {
      if (field.type === "select" || field.type === "checkbox-group") {
        assert.ok(Array.isArray(field.options) && field.options.length > 0, `${field.name} has no options`);
      }
    }
  }
});
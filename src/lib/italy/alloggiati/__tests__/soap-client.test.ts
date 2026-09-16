import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAuthenticationTestEnvelope,
  buildGenerateTokenEnvelope,
  buildSchedineTestEnvelope,
  parseAlloggiatiSoapResponse,
} from "../soap-client";
import { ALLOGGIATI_SOAP_NAMESPACE } from "../config";

describe("alloggiati soap-client", () => {
  it("builds GenerateToken envelope per WSDL namespace", () => {
    const xml = buildGenerateTokenEnvelope("XX002458", "secret", "wskey123");
    assert.match(xml, /<GenerateToken xmlns="AlloggiatiService">/);
    assert.match(xml, /<Utente>XX002458<\/Utente>/);
    assert.match(xml, /<WsKey>wskey123<\/WsKey>/);
    assert.doesNotMatch(xml, /&/);
  });

  it("builds Authentication_Test envelope", () => {
    const xml = buildAuthenticationTestEnvelope("XX002458", "TOKEN123");
    assert.match(xml, /<Authentication_Test xmlns="AlloggiatiService">/);
    assert.match(xml, /<token>TOKEN123<\/token>/);
  });

  it("builds Test envelope with schedine strings", () => {
    const line = "x".repeat(168);
    const xml = buildSchedineTestEnvelope("XX002458", "TOKEN", [line], "Test");
    assert.match(xml, /<Test xmlns="AlloggiatiService">/);
    assert.match(xml, /<ElencoSchedine>/);
    assert.match(xml, new RegExp(`<string>${line}</string>`));
  });

  it("uses Send operation name when live", () => {
    const xml = buildSchedineTestEnvelope("U", "T", ["a"], "Send");
    assert.match(xml, /<Send xmlns="AlloggiatiService">/);
  });

  it("parses successful Authentication_Test response", () => {
    const response = `<?xml version="1.0"?>
<Authentication_TestResponse xmlns="${ALLOGGIATI_SOAP_NAMESPACE}">
  <Authentication_TestResult>true</Authentication_TestResult>
</Authentication_TestResponse>`;
    const parsed = parseAlloggiatiSoapResponse(response, "Authentication_Test");
    assert.equal(parsed.esito, true);
    assert.equal(parsed.success, true);
  });

  it("parses GenerateToken response with token", () => {
    const response = `<?xml version="1.0"?>
<GenerateTokenResponse xmlns="${ALLOGGIATI_SOAP_NAMESPACE}">
  <GenerateTokenResult>
    <issued>2021-11-12T13:13:47</issued>
    <expires>2021-11-12T14:13:47</expires>
    <token>TOKENdiAutenticazioneValido</token>
  </GenerateTokenResult>
</GenerateTokenResponse>`;
    const parsed = parseAlloggiatiSoapResponse(response, "GenerateToken");
    assert.equal(parsed.token, "TOKENdiAutenticazioneValido");
    assert.equal(parsed.success, true);
  });

  it("escapes XML special characters in credentials", () => {
    const xml = buildGenerateTokenEnvelope("user", "p&ss<word>", "key");
    assert.match(xml, /<Password>p&amp;ss&lt;word&gt;<\/Password>/);
  });
});

import { SES_ENDPOINTS } from "./types";

export function isSesLiveEnabled(): boolean {
  return process.env.SES_LIVE === "true";
}

export function getSesEndpoint(): string {
  return isSesLiveEnabled() ? SES_ENDPOINTS.production : SES_ENDPOINTS.test;
}

export function canSubmitLive(userLiveEnabled: boolean): boolean {
  return isSesLiveEnabled() && userLiveEnabled;
}

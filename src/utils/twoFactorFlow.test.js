import { getTwoFactorSuccessTarget } from "./twoFactorFlow";

describe("getTwoFactorSuccessTarget", () => {
  it("prefers an explicit redirect target for password changes", () => {
    expect(
      getTwoFactorSuccessTarget({
        redirectTo: "/profile",
        pendingPasswordChange: { email: "user@example.com", newPassword: "123456" },
        user: { role: "user" },
      })
    ).toBe("/profile");
  });

  it("defaults to profile for profile updates when no redirect is provided", () => {
    expect(
      getTwoFactorSuccessTarget({
        pendingProfileUpdate: { email: "user@example.com", payload: {} },
        user: { role: "user" },
      })
    ).toBe("/profile");
  });
});

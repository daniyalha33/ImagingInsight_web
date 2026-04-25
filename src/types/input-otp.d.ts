// Ambient declaration for `input-otp` used in UI components.
// Provides minimal types so the TypeScript compiler can build without upstream types.
// If the real package provides types, prefer installing them instead:
// npm install input-otp

import * as React from "react";

declare module "input-otp" {
  export const OTPInput: React.ComponentType<any>;
  export const OTPInputContext: React.Context<any>;
  export default OTPInput;
}

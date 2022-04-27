import { useState } from "react";
export enum TestRunningStatus {
  Uninitialized = "Uninitialized",
  Running = "Running",
}
const nextTestRunningStatusMap = {
  [TestRunningStatus.Uninitialized]: TestRunningStatus.Running as const,
  [TestRunningStatus.Running]: TestRunningStatus.Uninitialized as const,
};
export function useTestRunningStatus() {
  const [testRunningStatus, setTestRunningStatus] =
    useState<`${TestRunningStatus}`>(TestRunningStatus.Uninitialized);

  function nextTestRunningStatus() {
    setTestRunningStatus((prev) => {
      return nextTestRunningStatusMap[prev];
    });
  }

  return {
    testRunningStatus,
    nextTestRunningStatus,
  };
}

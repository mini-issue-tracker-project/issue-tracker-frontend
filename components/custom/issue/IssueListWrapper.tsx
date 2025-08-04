"use client";

import { Suspense } from "react";
import { IssueList } from "./IssueList";

export default function IssueListWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IssueList />
    </Suspense>
  );
} 
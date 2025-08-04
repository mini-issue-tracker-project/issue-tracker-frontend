"use client";

import { Suspense } from "react";
import CommentSection from "./CommentSection";

interface CommentSectionWrapperProps {
  issueId: number;
}

export default function CommentSectionWrapper({ issueId }: CommentSectionWrapperProps) {
  return (
    <Suspense fallback={<div>Loading comments...</div>}>
      <CommentSection issueId={issueId} />
    </Suspense>
  );
} 
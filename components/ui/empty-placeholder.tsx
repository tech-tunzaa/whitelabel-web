import { ReactNode } from "react";
import { Card, CardContent } from "./card";

interface EmptyPlaceholderProps {
  children?: ReactNode;
  className?: string;
}

export function EmptyPlaceholder({ children, className }: EmptyPlaceholderProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        {children}
      </CardContent>
    </Card>
  );
}

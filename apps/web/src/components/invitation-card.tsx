import type { ReactNode } from "react";
import { invitationAction } from "@/app/organization-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InvitationCard({
  invitationId,
  title = "Convite para organização",
  description,
  redirectTo,
  children,
}: {
  invitationId: string;
  title?: ReactNode;
  description: ReactNode;
  redirectTo?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <form action={invitationAction} className="flex flex-wrap gap-3">
          <input type="hidden" name="invitationId" value={invitationId} />
          {redirectTo ? (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          ) : null}
          <Button name="decision" value="accept" type="submit">
            Aceitar convite
          </Button>
          <Button
            name="decision"
            value="reject"
            variant="outline"
            type="submit"
          >
            Recusar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

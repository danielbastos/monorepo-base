CREATE UNIQUE INDEX "account_providerId_accountId_key"
ON "account"("providerId", "accountId");

CREATE UNIQUE INDEX "member_organizationId_userId_key"
ON "member"("organizationId", "userId");

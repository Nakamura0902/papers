import { prisma } from "@/lib/prisma";
import DocumentManager from "./DocumentManager";

export const dynamic = "force-dynamic";

export default async function SettingsDocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { forms: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <DocumentManager
      items={documents.map((d) => ({
        id: d.id,
        key: d.key,
        name: d.name,
        category: d.category,
        defaultRequiredLevel: d.defaultRequiredLevel,
        purpose: d.purpose,
        whenRequired: d.whenRequired,
        whenNotRequired: d.whenNotRequired,
        submissionTo: d.submissionTo,
        storageLocation: d.storageLocation,
        requiresSignature: d.requiresSignature,
        requiresCompanySeal: d.requiresCompanySeal,
        notes: d.notes,
        isActive: d.isActive,
        schemaJson: d.forms[0]?.schemaJson ?? "",
      }))}
    />
  );
}

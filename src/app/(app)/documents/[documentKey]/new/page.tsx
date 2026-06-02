import FormClient from "./FormClient";

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ documentKey: string }>;
}) {
  const { documentKey } = await params;
  return <FormClient documentKey={documentKey} />;
}

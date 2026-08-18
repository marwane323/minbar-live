import { ListenClient } from "./listen-client";

interface PageProps {
  params: {
    session_id: string;
  };
}

export default function SessionListenPage({ params }: PageProps) {
  return <ListenClient sessionId={params.session_id} />;
}

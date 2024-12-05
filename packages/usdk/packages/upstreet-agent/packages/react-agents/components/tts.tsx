export type TTSProps = {
  voiceEndpoint?: string; // voice to use
};
export const TTS: React.FC<TTSProps> = (props: TTSProps) => {
  const voiceEndpoint = props?.voiceEndpoint;

  const tts = useTts({
    voiceEndpoint,
  });

  return (
    <ActionModifier
      name="say"
      handler={async (e: AbortableActionEvent) => {
        const { message, agent } = e.data;
        const args = message.args as any;
        const text = (args as any).text as string;

        const readableAudioStream = tts.getVoiceStream(text);
        const { type } = readableAudioStream;
        const playableAudioStream = readableAudioStream as PlayableAudioStream;
        playableAudioStream.id = crypto.randomUUID();
        agent.addAudioStream(playableAudioStream);

        if (!message.attachments) {
          message.attachments = [];
        }
        message.attachments.push({
          id: playableAudioStream.id,
          type: `${type}+voice`,
        });
      }}
    />
  );
};
export const Prompt = /*memo(*/(props: PromptProps) => {
  // const agent = useContext(AgentContext);
  const conversation = useContext(ConversationContext).conversation;

  // const deps = [
  //   props.children,
  // ];
  // agent.useEpoch(deps);

  return <prompt value={{
    ...props,
    conversation,
  }} />;
}//);
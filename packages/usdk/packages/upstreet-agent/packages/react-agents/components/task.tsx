export const Task = /*memo(*/(props: TaskProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(Symbol, []);

  const deps = [
    props.handler.toString(),
    props.onDone?.toString(),
  ];

  useEffect(() => {
    agentRegistry.registerTask(symbol, props);
    return () => {
      agentRegistry.unregisterTask(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <task value={props} />;
  return null;
}//);
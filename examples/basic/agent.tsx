import { AgentAppProps } from 'upstreet-sdk/agents';
import AgentApp from './impl';

export default function render(props: AgentAppProps) {
  return AgentApp(props);
}

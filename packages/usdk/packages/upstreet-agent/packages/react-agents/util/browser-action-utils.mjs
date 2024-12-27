// type WebBrowserToTextOptions = {
//   agent: AgentObject;
//   method: string;
//   args: any;
//   result: any;
//   error: any;
// };
// type WebBrowserToTextSpec = {
//   method: string;
//   toText: (options: WebBrowserToTextOptions) => string;
// };
const getActionErrorText = (error) => error ? ` (and it didn't work)` : '';
export const webbrowserActionsToText = [
  {
    method: 'createPage',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      return `${agent.name} created a new browser page${getActionErrorText(error)}`;
    },
  },
  {
    method: 'pageGoto',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      const {
        pageId,
        url,
      } = metadata;
      return `${agent.name} navigated to ${url} on page ${pageId}${getActionErrorText(error)}`;
    }
  },
  {
    method: 'elementClick',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      const {
        pageId,
        text,
      } = metadata;
      return `${agent.name} clicked on element with text ${text} on page ${pageId}${getActionErrorText(error)}`;
    }
  },
  {
    method: 'pageScreenshot',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      const {
        pageId,
      } = metadata;
      return `${agent.name} took a screenshot of page ${pageId}${getActionErrorText(error)}`;
    }
  },
  {
    method: 'pageClose',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      const {
        pageId,
      } = metadata;
      return `${agent.name} closed page ${pageId}${getActionErrorText(error)}`;
    },
  },
  {
    method: 'downloadUrl',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      const {
        url,
      } = metadata;
      return `${agent.name} downloaded a file from ${url}${getActionErrorText(error)}`;
    }
  },
  {
    method: 'cleanup',
    toText({
      agent,
      method,
      metadata,
      result,
      error,
    }) {
      return `${agent.name} cleaned up the browser${getActionErrorText(error)}`;
    }
  },
];
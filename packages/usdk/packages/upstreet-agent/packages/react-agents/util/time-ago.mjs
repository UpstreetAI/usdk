import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const ta = new TimeAgo('en-US');
export const timeAgo = (date) => ta.format(date);
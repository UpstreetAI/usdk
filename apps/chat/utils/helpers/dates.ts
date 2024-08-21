var moment = require('moment');

export const formatDateStringMoment = (date: string, format: string) => {
  var t = new Date(date); // Date String
  var formatDate = moment(t).format(format);
  return formatDate;
};
const messageRegex = /{([^{]*){message}([^{]*)}/i;

function extactMessages(template, messages, messagePattern='https://[\\wéáőúíóüö/\\-\\.]+') {
  const messagesPattern = template.match(messageRegex);

  const extractedContent = messages.reduce(
    (array, message) => {
      const matched = message.match(new RegExp(messagePattern, 'gi'));
      console.log('checking message', message, 'against', new RegExp(messagePattern, 'gi'), '=>', matched);
      return matched ? array.concat(matched) : array;
    },
    []
  )
  .map(message => `${messagesPattern[1]}${message}${messagesPattern[2]}`)
  .join('');

  // console.log('extractedContent', extractedContent);

  return extractedContent;
}

exports.extactMessages = extactMessages;

exports.messageRegex = messageRegex;

const {extactMessages} = require('./extactMessages')

describe('extract trello messages with link breaks', () => {
  const bodyTemplate = '## {{version}}\n\n{{date}}\n\n{ - {message}\n}';
  const messages2 = [
    'new version\nhttps://trello.com/whatever/asdasd-sd-sdf',
    'Merge pull request #12 from finnoconsult/fix/merge-dev-v1\n' +
      '\n' +
      'fix new https://trello.com/whatever/2nd-link\n' +
      'undefined'
  ];
  it('2 links', () => expect(extactMessages(bodyTemplate, messages2)).toEqual(" - https://trello.com/whatever/asdasd-sd-sdf\n - https://trello.com/whatever/2nd-link\n"));

  const messages3 = [
    'new version\nhttps://trello.com/whatever/asdasd-sd-sdf\nhttps://trello.com/whatever/SDFÁD-234534',
    'Merge pull request #12 from finnoconsult/fix/merge-dev-v1\n' +
      '\n' +
      'fix new https://trello.com/whatever/2nd-link\n' +
      'undefined'
  ];
  it('3 links', () => expect(extactMessages(bodyTemplate, messages3)).toEqual(" - https://trello.com/whatever/asdasd-sd-sdf\n - https://trello.com/whatever/SDFÁD-234534\n - https://trello.com/whatever/2nd-link\n"));

  const messages1 = [
    'new version\nhttps://trello.com/whatever/asdasd-sd-sdf',
    'Merge pull request #12 from finnoconsult/fix/merge-dev-v1\n' +
      'undefined'
  ];
  it('1 link', () => expect(extactMessages(bodyTemplate, messages1)).toEqual(" - https://trello.com/whatever/asdasd-sd-sdf\n"));
});

describe('extract trello messages with simple template', () => {
  const bodyTemplate = '{{message},}';
  const messages = [
    'new version\nhttps://trello.com/whatever/asdasd-sd-sdf',
    'Merge pull request #12 from finnoconsult/fix/merge-dev-v1\n' +
      '\n' +
      'fix new https://trello.com/whatever/2nd-link\n' +
      'undefined'
  ];
  it('2 links', () => expect(extactMessages(bodyTemplate, messages)).toEqual("https://trello.com/whatever/asdasd-sd-sdf,https://trello.com/whatever/2nd-link,"));
});

import { HelloWorldProjectPage } from './app.po';

describe('hello-world-project App', () => {
  let page: HelloWorldProjectPage;

  beforeEach(() => {
    page = new HelloWorldProjectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

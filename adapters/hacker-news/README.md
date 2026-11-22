# Hacker News

- [Front page](recipes/front-page.json) reads the stories on the first page of `/news` in rank order.
- [New](recipes/newest.json) reads the stories on the first page of `/newest` in submission order.

Both recipes return `outputs.stories`, an array of rows with the title in `text` and the story URL in `attributes.href`. They also return `outputs.headline` for callers that use the first title. Each read stops at the first page.

To filter both lists, install [Filter Hacker News stories with ChatGPT](../../workflows/filter-hacker-news.json). Open Hacker News, start the workflow, and choose **Review what goes to ChatGPT**. In **Additional instructions**, try “Keep stories about browser automation or open-source developer tools. Return up to five.” Review the results before accepting them. The workflow reads story titles and links.

[Supported origin and page targets](adapter.json)

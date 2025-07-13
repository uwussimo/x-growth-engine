# x growth engine

ai writes your tweets. you focus on building.

## why this exists

twitter replies are noise. this cuts through it.

six tones. one click. done.

## what it does

- focuses on reply boxes only
- generates three suggestions instantly
- inserts text where your cursor is
- matches twitter's dark mode
- stays invisible until you need it

## install

```bash
git clone https://github.com/uwussimo/x-growth-engine.git
cd x-growth-engine
```

chrome://extensions/

toggle developer mode.

load unpacked. select folder.

## setup

get openai api key. starts with sk-

click extension icon. paste key. pick tone. save.

## use

reply to any tweet. focus text area. hit generate. click suggestion.

## tones
- gen-z founder — energy, innovation, emojis
- professional — corporate safe
- casual — friendly neighbor
- witty — clever without trying
- supportive — empathy first
- custom — your rules

## how it works

<img width="588" height="561" alt="image" src="https://github.com/user-attachments/assets/269311d5-b11d-4364-bd4d-7144fd8e6ee6" />

floats above twitter's interface. immune to their dom changes.

focuses only when you focus. disappears when you're done.

no popups. no interruptions. no friction.

## tech

manifest v3. content script injection. floating overlay system.

881 lines of content script. 249 lines of styling.

works in chrome 88+. edge 88+. any chromium browser.

## files

```
x-growth-engine/
├── manifest.json
├── content.js
├── content.css
├── options.html
├── options.js
├── popup.html
├── popup.js
├── background.js
└── README.md
```

## contribute

fork. code. pull request.

test on twitter. break nothing. ship fast.

## license

mit.

## truth

not affiliated with twitter or openai.

use responsibly. respect terms of service.

## roadmap

chrome web store
claude support
thread awareness
bulk generation
usage analytics

## support

issues: https://github.com/uwussimo/x-growth-engine/issues
repo: https://github.com/uwussimo/x-growth-engine

---

built by [@uwussimo](https://github.com/uwussimo)

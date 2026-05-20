# cronlens

> A terminal dashboard for visualizing and testing cron expressions with next-run previews and history.

## Installation

```bash
npm install -g cronlens
```

## Usage

Launch the interactive terminal dashboard:

```bash
cronlens
```

Pass a cron expression directly to preview the next scheduled runs:

```bash
cronlens "0 9 * * 1-5"
```

### Dashboard Features

- **Live preview** — see the next N upcoming run times for any cron expression
- **Expression editor** — type or paste expressions and get instant feedback
- **History log** — track previously tested expressions across sessions
- **Human-readable output** — expressions are translated to plain English automatically

### Example Output

```
Expression : 0 9 * * 1-5
Description: At 09:00, Monday through Friday

Next runs:
  1. Mon, 12 Jun 2025 09:00:00
  2. Tue, 13 Jun 2025 09:00:00
  3. Wed, 14 Jun 2025 09:00:00
  4. Thu, 15 Jun 2025 09:00:00
  5. Fri, 16 Jun 2025 09:00:00
```

## Development

```bash
git clone https://github.com/yourname/cronlens.git
cd cronlens
npm install
npm run dev
```

## Requirements

- Node.js >= 18.x
- Terminal with UTF-8 support

## License

[MIT](LICENSE)
# Mandolin — Elegant TUI Utilities for Node.js

> **Work in progress** — This library is under active development. Some APIs may change in upcoming releases.

---

## 🚀 Overview

**Mandolin** is a small collection of utilities for building interactive text-based interfaces (TUI) in **Node.js**. It provides input prompts, interactive selections, animated spinners, and ANSI text styling tools — all fully typed in **TypeScript** and designed for simplicity and extensibility.

---

## 📦 Installation

```bash
npm install @virtual-registry/mandolin
# or
yarn add @virtual-registry/mandolin
```

> Requirements: Node.js >= 18 and TTY support (recommended).

---

## 🧰 Core Features

### 🖊 InputPrompt

Prompts the user for textual input in a synchronous, async-friendly way.

```ts
const name = await InputPrompt("What's your name? ");
console.log(`Hello ${name}!`);
```

Optionally supports an `onAfterEnter` callback executed after confirmation.

---

### 🎯 SelectPrompt

An interactive prompt for choosing an option from a list.

```ts
const color = await SelectPrompt(["Red", "Green", "Blue"], {
  noTTYFallbackText: "Choose a color:",
  onAfterSelection: (val) => console.log(`You selected ${val}`)
});
```

**Configuration (`SelectConfig`):**

* `noTTYFallbackText`: text displayed when TTY is not available
* `onAfterSelection(value)`: callback after a selection is made
* `onCancel()`: callback when user cancels (Ctrl+C)

---

### 🎨 text()

Applies ANSI styling to a string:

```ts
console.log(text("Warning!", { color: 196, effect: 'bold' }));
```

Supports:

* `color`: text color (0–255)
* `bgcolor`: background color (0–255)
* `effect`: visual effect (bold, dim, underline, blink, etc.)

---

### 🔄 Spinner

Displays a loading animation in the terminal.

```ts
const spinner = new Spinner({ color: 82 }, "Processing");
spinner.start();
setTimeout(() => spinner.stop("Done!"), 2000);
```

### 🧱 Terminal<S>

A small framework for building sequential CLI flows with shared state.

```ts
const terminal = new Terminal<{ name: string }>();
terminal.initState({ name: '' });

terminal.newLine("Welcome!");
terminal.newInputLine((val, state) => ({ name: val }));
terminal.newLine((state) => Promise.resolve({}));

await terminal.draw({ clean: true, closeStream: true });
```

Combine static lines, input prompts, and selections while maintaining a centralized state.

---

## 🧪 Project Status

> **Mandolin** is currently in *alpha* stage.
> APIs may evolve, and multi-platform compatibility and automated tests are still under development.

Planned features:

* Full support for non-ANSI Windows terminals
* Improved non-interactive mode
* CLI test suite using `vitest`

---

## 🧭 License

MIT © 2025 — *Mandolin Project* (Work in Progress)

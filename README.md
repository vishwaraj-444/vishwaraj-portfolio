# Unfolding Canvas

Build a premium interactive landing page for my portfolio inspired by the tactile experience of the Tearable UI demo (https://pushmatrix.github.io/tearable/), but do not copy its code or visual assets.

The experience should begin with a single full-screen paper sheet covering the entire viewport. The paper should have a realistic texture, subtle shadows, slightly curled edges while dragging, and feel like thick premium cardstock.

The paper must be fully interactive. Users should be able to click or touch anywhere on the paper and drag to stretch it. Use a cloth-style physics simulation (Verlet Integration with distance constraints) so the paper tears naturally based on user interaction rather than a pre-recorded animation. The tear should be organic and irregular.

Once the paper has been torn apart, the torn pieces should fall downward with gravity, fade away naturally, and never reappear. The underlying portfolio should already exist beneath the paper and become visible seamlessly.

The revealed hero section should contain:

• A modern developer portfolio layout

• My name

• Software Engineer / AI Engineer title

• Short introduction

• Resume button

• Contact button

• Scroll indicator

The visual style should be premium, modern, and minimalist with a dark theme, subtle gradients, glassmorphism, smooth animations, and polished micro-interactions.

Use Next.js 15, React 19, TypeScript, Tailwind CSS, and a custom physics implementation. Avoid Three.js, Babylon.js, or heavy 3D libraries. Prioritize performance, responsiveness, accessibility, and clean component architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7346079b-0c6a-4976-a53f-e9e5421d3584).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
